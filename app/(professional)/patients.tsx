import { showAppAlert } from "@/src/components/AppAlert";
import {
  ActivePatientRow,
  ClinicSectionLabel,
  PendingRequestCard,
} from "@/src/components/ClinicChrome";
import { EmptyState } from "@/src/components/EmptyState";
import { TextField } from "@/src/components/TextField";
import {
  Card,
  PageHeader,
  PrimaryButton,
  Screen,
  SecondaryButton,
  screenScrollContent,
} from "@/src/components/ui";
import { brand } from "@/src/theme/brand";
import { useAuth } from "@/src/contexts/AuthContext";
import { formatIsoDatePt } from "@/src/domain/timeHelpers";
import {
  addPatientByProfessional,
  approvePatient,
  blockPatient,
  listBlockedPatientsForProfessional,
  listPatientsForProfessional,
  listPendingPatientsForProfessional,
  rejectPatient,
  removePatientFromClinic,
  setChartEmail,
  unblockPatient,
} from "@/src/services/patients";
import type { SonoPatient } from "@/src/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ProfessionalPatientsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<SonoPatient[]>([]);
  const [patients, setPatients] = useState<SonoPatient[]>([]);
  const [blocked, setBlocked] = useState<SonoPatient[]>([]);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [editing, setEditing] = useState<SonoPatient | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [p, a, b] = await Promise.all([
        listPendingPatientsForProfessional(user.uid),
        listPatientsForProfessional(user.uid),
        listBlockedPatientsForProfessional(user.uid),
      ]);
      setPending(p);
      setPatients(a);
      setBlocked(b);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const runAction = async (
    patientUid: string,
    action: () => Promise<void>,
    okTitle: string,
    okMessage: string
  ) => {
    try {
      setBusyUid(patientUid);
      await action();
      await load();
      showAppAlert(okTitle, okMessage);
    } catch (e) {
      showAppAlert("Não foi possível", e instanceof Error ? e.message : "Erro");
    } finally {
      setBusyUid(null);
    }
  };

  const onAdd = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const created = await addPatientByProfessional({
        professionalId: user.uid,
        displayName: draftName,
        email: draftEmail,
      });
      setDraftName("");
      setDraftEmail("");
      setAdding(false);
      await load();
      showAppAlert(
        "Paciente adicionada",
        `${created.displayName} já está em Ativos. Abra o nome para preencher o diário, inclusive pela folha de papel.`
      );
    } catch (e) {
      showAppAlert("Não foi possível", e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const onApprove = (p: SonoPatient) => {
    showAppAlert("Aprovar paciente?", `${p.displayName} poderá usar o diário.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aprovar",
        onPress: () =>
          void runAction(
            p.patientUid,
            () => approvePatient(p.patientUid),
            "Aprovada",
            `${p.displayName} já está ativa na sua clínica.`
          ),
      },
    ]);
  };

  const onReject = (p: SonoPatient) => {
    showAppAlert(
      "Recusar pedido?",
      `${p.displayName} não terá acesso ao diário.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recusar",
          style: "destructive",
          onPress: () =>
            void runAction(
              p.patientUid,
              () => rejectPatient(p.patientUid),
              "Pedido recusado",
              `${p.displayName} foi removida da fila.`
            ),
        },
      ]
    );
  };

  const onBlock = (p: SonoPatient) => {
    showAppAlert(
      "Bloquear paciente?",
      `${p.displayName} não poderá preencher o diário. O histórico clínico permanece.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Bloquear",
          style: "destructive",
          onPress: () =>
            void runAction(
              p.patientUid,
              () => blockPatient(p.patientUid),
              "Bloqueada",
              `${p.displayName} está bloqueada.`
            ),
        },
      ]
    );
  };

  const onRemove = (p: SonoPatient) => {
    showAppAlert(
      "Remover da clínica?",
      `${p.displayName} sai da sua lista. Os registros clínicos ficam arquivados.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () =>
            void runAction(
              p.patientUid,
              () => removePatientFromClinic(p.patientUid),
              "Removida",
              `${p.displayName} não aparece mais em Pacientes.`
            ),
        },
      ]
    );
  };

  const onUnblock = (p: SonoPatient) => {
    showAppAlert(
      "Desbloquear?",
      `${p.displayName} volta a poder preencher o diário.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desbloquear",
          onPress: () =>
            void runAction(
              p.patientUid,
              () => unblockPatient(p.patientUid),
              "Desbloqueada",
              `${p.displayName} está ativa novamente.`
            ),
        },
      ]
    );
  };

  const onSaveEmail = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      await setChartEmail({
        patientUid: editing.patientUid,
        email: draftEmail,
      });
      setEditing(null);
      setDraftEmail("");
      await load();
      showAppAlert(
        "E-mail salvo",
        "Quando essa pessoa criar a conta com este e-mail, ela entra nesta ficha, sem outro cadastro."
      );
    } catch (e) {
      showAppAlert("Não foi possível", e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const openManageMenu = (p: SonoPatient) => {
    showAppAlert(p.displayName, "Gerenciar vínculo clínico", [
      { text: "Cancelar", style: "cancel" },
      {
        text: p.email ? "Trocar e-mail" : "Colocar e-mail",
        onPress: () => {
          setEditing(p);
          setDraftEmail(p.email || "");
          setAdding(false);
        },
      },
      {
        text: "Bloquear",
        style: "destructive",
        onPress: () => onBlock(p),
      },
      {
        text: "Remover da clínica",
        style: "destructive",
        onPress: () => onRemove(p),
      },
    ]);
  };

  return (
    <Screen edges="top" atmosphere="soft">
      <AppScrollView
        keepFocusedVisible
        className="flex-1 px-5"
        contentContainerStyle={screenScrollContent}
      >
        <PageHeader
          title="Pacientes"
          subtitle="Adicione pacientes e preencha o diário, inclusive quem só entrega a folha. Toque no nome para abrir o ciclo."
        />

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color={brand.argila} />
          </View>
        ) : (
          <View className="mt-5 gap-6">
            {editing ? (
              <Card>
                <TextField
                  label="E-mail da conta"
                  value={draftEmail}
                  onChangeText={setDraftEmail}
                  placeholder="o e-mail que a pessoa vai usar"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text className="mb-4 font-sans text-xs leading-5 text-sleep-muted">
                  {editing.displayName} cria a conta com este e-mail e entra
                  nesta ficha, com o diário que você já preencheu.
                </Text>
                <PrimaryButton
                  label={saving ? "Salvando…" : "Salvar e-mail"}
                  onPress={() => void onSaveEmail()}
                  disabled={saving || !draftEmail.includes("@")}
                />
                <View className="h-3" />
                <SecondaryButton
                  label="Cancelar"
                  onPress={() => setEditing(null)}
                  disabled={saving}
                />
              </Card>
            ) : adding ? (
              <Card>
                <TextField
                  label="Nome"
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholder="Nome da paciente"
                  autoCapitalize="words"
                />
                <TextField
                  label="E-mail"
                  value={draftEmail}
                  onChangeText={setDraftEmail}
                  placeholder="Opcional, se um dia usar o app"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text className="mb-4 font-sans text-xs leading-5 text-sleep-muted">
                  Sem e-mail, o acompanhamento fica só com você, pela folha de
                  papel.
                </Text>
                <PrimaryButton
                  label={saving ? "Salvando…" : "Salvar paciente"}
                  onPress={() => void onAdd()}
                  disabled={saving || draftName.trim().length < 2}
                />
                <View className="h-3" />
                <SecondaryButton
                  label="Cancelar"
                  onPress={() => setAdding(false)}
                  disabled={saving}
                />
              </Card>
            ) : (
              <PrimaryButton
                label="Adicionar paciente"
                onPress={() => setAdding(true)}
              />
            )}

            {pending.length > 0 ? (
              <View className="gap-3">
                <ClinicSectionLabel
                  trailing={
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>
                        {pending.length}
                      </Text>
                    </View>
                  }
                >
                  Pendentes
                </ClinicSectionLabel>
                {pending.map((p) => (
                  <PendingRequestCard
                    key={p.patientUid}
                    name={p.displayName}
                    email={p.email}
                    requestedLabel={
                      p.requestedAt
                        ? `Pedido em ${formatIsoDatePt(p.requestedAt.slice(0, 10))}`
                        : undefined
                    }
                    busy={busyUid === p.patientUid}
                    onApprove={() => onApprove(p)}
                    onReject={() => onReject(p)}
                  />
                ))}
              </View>
            ) : null}

            <View>
              <ClinicSectionLabel>Ativos</ClinicSectionLabel>
              {patients.length === 0 ? (
                <Card className="mt-2">
                  <EmptyState
                    compact
                    title="Nenhuma paciente ativa"
                    message={
                      pending.length > 0
                        ? "Aprove os pedidos acima para liberar o diário."
                        : "Toque em Adicionar paciente para começar o acompanhamento, inclusive só pela folha de papel."
                    }
                  />
                </Card>
              ) : (
                <View style={styles.activeList}>
                  {patients.map((p) => (
                    <ActivePatientRow
                      key={p.patientUid}
                      name={p.displayName}
                      email={p.email || "Acompanhamento pela folha"}
                      progress={`${p.filledDays}/${p.expectedDays || 7}`}
                      onOpen={() =>
                        router.push(
                          `/(professional)/patient/${p.patientUid}`
                        )
                      }
                      onManage={() => openManageMenu(p)}
                    />
                  ))}
                </View>
              )}
            </View>

            {blocked.length > 0 ? (
              <View className="gap-2">
                <ClinicSectionLabel>Bloqueados</ClinicSectionLabel>
                {blocked.map((p) => (
                  <View key={p.patientUid} style={styles.blockedRow}>
                    <View style={styles.blockedMain}>
                      <Text style={styles.blockedName}>{p.displayName}</Text>
                      <Text style={styles.blockedEmail}>{p.email}</Text>
                    </View>
                    <SecondaryButton
                      label={
                        busyUid === p.patientUid ? "…" : "Desbloquear"
                      }
                      onPress={() => onUnblock(p)}
                      disabled={busyUid === p.patientUid}
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </AppScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pendingBadge: {
    minWidth: 22,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(173, 102, 92, 0.18)",
    alignItems: "center",
  },
  pendingBadgeText: {
    fontFamily: "WorkSans_600SemiBold",
    fontSize: 12,
    color: brand.argila,
  },
  activeList: {
    marginTop: 8,
  },
  blockedRow: {
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 200, 180, 0.85)",
    backgroundColor: "rgba(250, 247, 240, 0.95)",
  },
  blockedMain: {
    marginBottom: 4,
  },
  blockedName: {
    fontFamily: "WorkSans_600SemiBold",
    fontSize: 15,
    color: brand.ink,
  },
  blockedEmail: {
    marginTop: 2,
    fontFamily: "WorkSans_400Regular",
    fontSize: 13,
    color: brand.muted,
  },
});
