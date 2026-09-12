import { showAppAlert } from "@/src/components/AppAlert";
import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
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
  Pressable,
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
    <Screen edges="top">
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
          <View className="mt-5 gap-5">
            {pending.length > 0 ? (
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
                    Pendentes
                  </Text>
                  <View className="rounded-full bg-sleep-accentSoft px-2.5 py-1">
                    <Text className="font-sansMed text-xs text-sleep-accent">
                      {pending.length}
                    </Text>
                  </View>
                </View>
                {pending.map((p) => (
                  <Card key={p.patientUid}>
                    <Text className="font-sansBold text-lg text-sleep-ink">
                      {p.displayName}
                    </Text>
                    <Text className="mt-1 font-sans text-sm text-sleep-muted">
                      {p.email}
                    </Text>
                    {p.requestedAt ? (
                      <Text className="mt-1 font-sans text-xs text-sleep-muted">
                        Pedido em {formatIsoDatePt(p.requestedAt.slice(0, 10))}
                      </Text>
                    ) : null}
                    <View className="mt-4 flex-row gap-2">
                      <View className="flex-1">
                        <SecondaryButton
                          label="Recusar"
                          onPress={() => onReject(p)}
                          disabled={busyUid === p.patientUid}
                        />
                      </View>
                      <View className="flex-1">
                        <PrimaryButton
                          label={
                            busyUid === p.patientUid ? "…" : "Aprovar"
                          }
                          onPress={() => onApprove(p)}
                          disabled={busyUid === p.patientUid}
                        />
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ) : null}

            <View className="gap-3">
              <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
                Ativos
              </Text>
              {patients.length === 0 ? (
                <Card>
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
                patients.map((p) => (
                  <Card key={p.patientUid}>
                    <View className="flex-row items-start justify-between gap-2">
                      <Pressable
                        className="min-w-0 flex-1 pr-2"
                        onPress={() =>
                          router.push(
                            `/(professional)/patient/${p.patientUid}`
                          )
                        }
                      >
                        <Text className="font-sansBold text-lg text-sleep-ink">
                          {p.displayName}
                        </Text>
                        <Text className="mt-1 font-sans text-sm text-sleep-muted">
                          {p.email}
                        </Text>
                      </Pressable>
                      <View className="items-end gap-2">
                        <View className="rounded-full bg-sleep-accentSoft px-3 py-1.5">
                          <Text className="font-sansMed text-xs text-sleep-accent">
                            {p.filledDays}/{p.expectedDays || 7}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => openManageMenu(p)}
                          hitSlop={8}
                          className="rounded-full border border-sleep-line px-3 py-1.5"
                        >
                          <Text className="font-sansMed text-xs text-sleep-rose">
                            Gerir
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </View>

            {blocked.length > 0 ? (
              <View className="gap-3">
                <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
                  Bloqueados
                </Text>
                {blocked.map((p) => (
                  <Card key={p.patientUid}>
                    <Text className="font-sansBold text-lg text-sleep-ink">
                      {p.displayName}
                    </Text>
                    <Text className="mt-1 font-sans text-sm text-sleep-muted">
                      {p.email}
                    </Text>
                    <View className="mt-3">
                      <SecondaryButton
                        label={
                          busyUid === p.patientUid
                            ? "…"
                            : "Desbloquear"
                        }
                        onPress={() => onUnblock(p)}
                        disabled={busyUid === p.patientUid}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </AppScrollView>
    </Screen>
  );
}
