import { showAppAlert } from "@/src/components/AppAlert";
import {
  ActivePatientRow,
  ClinicSectionLabel,
  PendingRequestCard,
} from "@/src/components/ClinicChrome";
import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
import {
  Card,
  PageHeader,
  Screen,
  SecondaryButton,
  screenScrollContent,
} from "@/src/components/ui";
import { brand } from "@/src/theme/brand";
import { useAuth } from "@/src/contexts/AuthContext";
import { formatIsoDatePt } from "@/src/domain/timeHelpers";
import {
  approvePatient,
  blockPatient,
  listBlockedPatientsForProfessional,
  listPatientsForProfessional,
  listPendingPatientsForProfessional,
  rejectPatient,
  removePatientFromClinic,
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
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<SonoPatient[]>([]);
  const [patients, setPatients] = useState<SonoPatient[]>([]);
  const [blocked, setBlocked] = useState<SonoPatient[]>([]);
  const [busyUid, setBusyUid] = useState<string | null>(null);

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

  const openManageMenu = (p: SonoPatient) => {
    showAppAlert(p.displayName, "Gerenciar vínculo clínico", [
      { text: "Cancelar", style: "cancel" },
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
        className="flex-1 px-5"
        contentContainerStyle={screenScrollContent}
      >
        <PageHeader
          eyebrow={profile?.clinicName || "Clínica Cuidar"}
          title="Pacientes"
          subtitle="Aprove pedidos novos e gerencie quem pode usar o diário. Toque no nome para abrir o ciclo."
        />

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color={brand.argila} />
          </View>
        ) : (
          <View className="mt-5 gap-6">
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
                    image={emptyStateImages.rest}
                    title="Nenhuma paciente ativa"
                    message={
                      pending.length > 0
                        ? "Aprove os pedidos acima para liberar o diário."
                        : "Quando alguém se cadastrar no app, o pedido aparece em Pendentes."
                    }
                  />
                </Card>
              ) : (
                <View style={styles.activeList}>
                  {patients.map((p) => (
                    <ActivePatientRow
                      key={p.patientUid}
                      name={p.displayName}
                      email={p.email}
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
