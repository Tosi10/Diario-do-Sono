const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const nodemailer = require("nodemailer");

initializeApp();

const smtpHost = defineString("SMTP_HOST", { default: "" });
const smtpUser = defineString("SMTP_USER", { default: "" });
const smtpPass = defineString("SMTP_PASS", { default: "" });
const smtpFrom = defineString("SMTP_FROM", { default: "" });

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
