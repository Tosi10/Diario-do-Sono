import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
import {
  ClinicStatsStrip,
  ClinicSectionLabel,
  PendingCallout,
  UpdateRow,
} from "@/src/components/ClinicChrome";
import {
  Card,
  GreetingBlock,
  PageHeader,
  Screen,
  screenScrollContent,
} from "@/src/components/ui";
import { brand } from "@/src/theme/brand";
import { useAuth } from "@/src/contexts/AuthContext";
import { formatIsoDatePt, toIsoDate } from "@/src/domain/timeHelpers";
import {
  getProfessionalHomeData,
  type ProfessionalHomeData,
} from "@/src/services/professionalHome";
import { brandCopy } from "@/src/theme/brand";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppScrollView } from "@/src/components/AppScrollView";
import {
  ActivityIndicator,
  View,
} from "react-native";

export default function ProfessionalHomeScreen() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfessionalHomeData | null>(null);
  const todayIso = toIsoDate(new Date());

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!user) return;
        setLoading(true);
        try {
          const home = await getProfessionalHomeData(user.uid);
          if (alive) setData(home);
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [user])
  );

  return (
    <Screen edges="top" atmosphere="soft">
      <AppScrollView
        className="flex-1 px-5"
        contentContainerStyle={screenScrollContent}
      >
        <GreetingBlock
          eyebrow={brandCopy.appName}
          name={profile?.displayName?.split(" ")[0] || "doutora"}
        />

        <PageHeader
          title="Início"
          subtitle={`${formatIsoDatePt(todayIso)} · atualizações dos seus pacientes.`}
        />

        {loading || !data ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color={brand.argila} />
          </View>
        ) : (
          <View className="mt-6 gap-5">
            {data.pendingApprovals > 0 ? (
              <PendingCallout
                count={data.pendingApprovals}
                onPress={() => router.push("/(professional)/patients")}
              />
            ) : null}

            {data.totalPatients === 0 && data.pendingApprovals === 0 ? (
              <Card>
                <EmptyState
                  image={emptyStateImages.rest}
                  title="Sua clínica digital"
                  message="Quando alguém se cadastrar no app, o pedido aparece em Pacientes para você aprovar."
                />
              </Card>
            ) : (
              <>
                <ClinicStatsStrip
                  items={[
                    { label: "Ativas", value: data.totalPatients },
                    {
                      label: "Hoje ok",
                      value: data.filledToday,
                      emphasize: true,
                    },
                  ]}
                />

                <View>
                  <ClinicSectionLabel>Atualizações recentes</ClinicSectionLabel>
                  {data.updates.length === 0 ? (
                    <Card className="mt-2">
                      <EmptyState
                        compact
                        image={emptyStateImages.ginkgo}
                        title="Semana tranquila"
                        message="Nenhum registro novo nesta semana. Quando alguém preencher o diário, aparece aqui."
                      />
                    </Card>
                  ) : (
                    <View className="mt-1">
                      {data.updates.map((u) => (
                        <UpdateRow
                          key={u.patient.patientUid}
                          name={u.patient.displayName}
                          detail={
                            u.filledToday
                              ? "Registrou o dia de hoje"
                              : `Último registro: ${formatIsoDatePt(u.lastDay!.date)}`
                          }
                          meta={`Semana ${u.filledDays}/${u.expectedDays} dias`}
                          badge={u.filledToday ? "Hoje" : "Recente"}
                          badgeTone={u.filledToday ? "accent" : "muted"}
                          onPress={() =>
                            router.push(
                              `/(professional)/patient/${u.patient.patientUid}`
                            )
                          }
                        />
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </AppScrollView>
    </Screen>
  );
}
