const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const { getStorage } = require("firebase-admin/storage");
const nodemailer = require("nodemailer");

initializeApp();

const smtpHost = defineString("SMTP_HOST", { default: "" });
const smtpUser = defineString("SMTP_USER", { default: "" });
const smtpPass = defineString("SMTP_PASS", { default: "" });
const smtpFrom = defineString("SMTP_FROM", { default: "" });
const geminiApiKey = defineString("GEMINI_API_KEY", { default: "" });
const geminiModel = defineString("GEMINI_MODEL", {
  default: "gemini-2.5-flash",
});

function mailTransport() {
  const host = smtpHost.value();
  const user = smtpUser.value();
  const pass = smtpPass.value();
  if (!host || !user || !pass) return null;
  return {
    from: `Sono à Vista <${smtpFrom.value() || user}>`,
    transport: nodemailer.createTransport({
      host,
      port: 587,
      secure: false,
      auth: { user, pass },
    }),
  };
}

/**
 * Paciente entrou em Pendentes → avisa a caixa de teste da clínica.
 * Enquanto a conta oficial não existe, o destino é admin@vision10.com.br
 * (campo notifyEmail em sonoClinic/main).
 */
exports.onPatientPending = onDocumentCreated(
  {
    document: "sonoPatients/{patientId}",
    region: "southamerica-east1",
  },
  async (event) => {
    const data = event.data?.data();
    if (!data || data.status !== "pending") return;

    const clinic = await getFirestore().doc("sonoClinic/main").get();
    const to =
      (clinic.exists && clinic.data().notifyEmail) ||
      "admin@vision10.com.br";

    const mail = mailTransport();
    if (!mail) {
      console.warn(
        "SMTP não configurado. Pedido pendente de",
        data.email,
        "não foi enviado para",
        to
      );
      return;
    }

    const name = data.displayName || "Paciente";
    const email = data.email || "sem e-mail";
    await mail.transport.sendMail({
      from: mail.from,
      to,
      subject: `Sono à Vista — pedido de ${name}`,
      text: [
        `${name} pediu para usar o diário.`,
        `E-mail: ${email}`,
        "",
        "Abra o app em Pacientes e aprove ou recuse.",
      ].join("\n"),
    });
  }
);

/** Doutora aprovou ou recusou um pedido → avisa o e-mail da pessoa. */
exports.onPatientResolved = onDocumentUpdated(
  {
    document: "sonoPatients/{patientId}",
    region: "southamerica-east1",
  },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after || before.status !== "pending") return;

    const to = String(after.email || "").trim();
    if (!to) return;

    let subject = "";
    let text = "";
    const name = after.displayName || "Olá";
    if (after.status === "active") {
      subject = "Sono à Vista — seu acesso foi liberado";
      text = [
        `${name}, a Dra. Ana liberou o seu diário.`,
        "",
        "Abra o app Sono à Vista e você já pode registrar as noites.",
      ].join("\n");
    } else if (after.status === "removed") {
      subject = "Sono à Vista — acesso não liberado";
      text = [
        `${name}, a Dra. Ana não liberou o acesso agora.`,
        "",
        "Se precisar, fale com ela na consulta.",
      ].join("\n");
    } else {
      return;
    }

    const mail = mailTransport();
    if (!mail) {
      console.warn("SMTP não configurado. Aviso para", to, "não foi enviado.");
      return;
    }
    await mail.transport.sendMail({
      from: mail.from,
      to,
      subject,
      text,
    });
  }
);

/** Liga o login novo à ficha que a doutora já criou com o mesmo e-mail. */
exports.claimChart = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Entre na conta.");
    }
    const email = String(request.auth.token.email || "").toLowerCase();
    if (!email) {
      throw new HttpsError("failed-precondition", "Conta sem e-mail.");
    }

    const db = getFirestore();
    const snap = await db.collection("sonoPatients").where("email", "==", email).get();
    const chart = snap.docs.find((doc) => {
      const data = doc.data();
      const status = data.status || "active";
      return (
        doc.id !== request.auth.uid &&
        !data.accountUid &&
        status === "active"
      );
    });
    if (!chart) return { claimed: false };

    const oldId = chart.id;
    const uid = request.auth.uid;
    const data = chart.data();
    const now = new Date().toISOString();

    const weeks = await db.collection("sonoWeeks").where("patientUid", "==", oldId).get();
    const days = await db.collection("sonoDays").where("patientUid", "==", oldId).get();

    let batch = db.batch();
    let n = 0;
    const commit = async () => {
      if (n === 0) return;
      await batch.commit();
      batch = db.batch();
      n = 0;
    };
    const queue = (ref, patch) => {
      batch.set(ref, patch, { merge: true });
      n += 1;
    };
    const remove = (ref) => {
      batch.delete(ref);
      n += 1;
    };

    for (const week of weeks.docs) {
      const w = week.data();
      const newWeekId = `${uid}_${w.startDate}`;
      queue(db.collection("sonoWeeks").doc(newWeekId), {
        ...w,
        weekId: newWeekId,
        patientUid: uid,
        updatedAt: now,
      });
      if (week.id !== newWeekId) remove(week.ref);
      if (n >= 400) await commit();
    }
    for (const day of days.docs) {
      const d = day.data();
      const date = d.date;
      const start =
        typeof d.weekId === "string" && d.weekId.startsWith(`${oldId}_`)
          ? d.weekId.slice(oldId.length + 1)
          : null;
      const movedWeekId = start ? `${uid}_${start}` : d.weekId;
      const newDayId = `${movedWeekId}_${date}`;
      queue(db.collection("sonoDays").doc(newDayId), {
        ...d,
        dayId: newDayId,
        weekId: movedWeekId,
        patientUid: uid,
        updatedAt: now,
      });
      if (day.id !== newDayId) remove(day.ref);
      if (n >= 400) await commit();
    }
    await commit();

    const activeWeekId =
      typeof data.activeWeekId === "string" &&
      data.activeWeekId.startsWith(`${oldId}_`)
        ? `${uid}_${data.activeWeekId.slice(oldId.length + 1)}`
        : data.activeWeekId ?? null;

    await db.collection("sonoPatients").doc(uid).set({
      ...data,
      patientUid: uid,
      accountUid: uid,
      email,
      status: "active",
      activeWeekId,
      updatedAt: now,
    });
    await chart.ref.delete();

    return { claimed: true, professionalId: data.professionalId };
  }
);

function asText(value) {
  if (value == null) return "";
  return String(value).trim();
}

function asTime(value) {
  const raw = asText(value);
  const match = raw.match(/^(\d{1,2})\s*[:hH]\s*(\d{2})/);
  if (!match) return "";
  const hour = Math.min(23, Number(match[1]));
  const minute = Math.min(59, Number(match[2]));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function asInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

function asScore(value) {
  return Math.max(0, Math.min(10, asInt(value)));
}

const DIARY_PROMPT = [
  "Você lê a folha manuscrita do Diário do Sono (tabela de até 7 colunas, uma por noite).",
  "Extraia só o que estiver visível. Não invente números.",
  "Responda apenas JSON com este formato:",
  '{"patientNameGuess":null,"warnings":[],"days":[{"dayIndex":1,"date":null,"q0":null,"q1":null,"q2":null,"q3":null,"q4Min":null,"q5":null,"q6Minutes":[],"q7Min":null,"q8":null,"q9":null,"q10":null,"qualityFeel":null,"qualityEnjoy":null,"confidence":0}]}',
  "q0 = hora de acordar. q1 = saiu da cama. q2 = foi para a cama. q3 = tentou dormir. Horários HH:mm.",
  "q4Min = minutos até dormir. q5 = quantas vezes despertou. q6Minutes = minutos de cada despertar.",
  "q7Min = tempo total dormido em minutos. q8 = álcool. q9 = comprimidos. q10 = comentários.",
  "qualityFeel e qualityEnjoy de 0 a 10. date em AAAA-MM-DD se a data estiver legível, senão null.",
  "confidence de 0 a 1 por dia. warnings lista o que estiver ilegível.",
].join("\n");

exports.sonoExtractDiaryFromImage = onCall(
  { region: "southamerica-east1", timeoutSeconds: 120, memory: "512MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Entre na conta.");
    }
    const storagePath = String(request.data?.storagePath || "");
    if (!storagePath.startsWith("sono/diary-photos/")) {
      throw new HttpsError("invalid-argument", "Foto inválida.");
    }
    const key = geminiApiKey.value();
    if (!key) {
      throw new HttpsError(
        "failed-precondition",
        "A leitura por IA ainda não tem a chave do Gemini."
      );
    }

    const [bytes] = await getStorage().bucket().file(storagePath).download();
    const model = geminiModel.value() || "gemini-2.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: DIARY_PROMPT },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: bytes.toString("base64"),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      }
    );
    if (!response.ok) {
      console.error("Gemini HTTP", response.status);
      throw new HttpsError(
        "internal",
        "A leitura da folha falhou. Confira a chave do Gemini e tente de novo."
      );
    }
    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new HttpsError("internal", "A leitura não voltou um formulário válido.");
    }

    const targetDate = asText(request.data?.targetDate);
    const days = Array.isArray(parsed.days) ? parsed.days : [];
    return {
      patientNameGuess: parsed.patientNameGuess || null,
      warnings: Array.isArray(parsed.warnings)
        ? parsed.warnings.map((item) => asText(item)).filter(Boolean).slice(0, 8)
        : [],
      days: days.slice(0, 7).map((day, index) => ({
        dayIndex: asInt(day.dayIndex) || index + 1,
        date: targetDate || asText(day.date),
        q0: asTime(day.q0),
        q1: asTime(day.q1),
        q2: asTime(day.q2),
        q3: asTime(day.q3),
        q4: asInt(day.q4Min),
        q5: asInt(day.q5),
        q6: Array.isArray(day.q6Minutes)
          ? day.q6Minutes.map(asInt).filter((n) => n > 0)
          : [],
        q7: asInt(day.q7Min),
        q8: asText(day.q8),
        q9: asText(day.q9),
        q10: asText(day.q10),
        qualityFeel: asScore(day.qualityFeel),
        qualityEnjoy: asScore(day.qualityEnjoy),
        confidence: Math.max(0, Math.min(1, Number(day.confidence) || 0)),
      })),
    };
  }
);
