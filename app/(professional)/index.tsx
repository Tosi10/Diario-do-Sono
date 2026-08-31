import { EmptyState, emptyStateImages } from "@/src/components/EmptyState";
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
  Pressable,
  Text,
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
    <Screen edges="top">
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
        ) : data.totalPatients === 0 ? (
          <Card className="mt-6">
            <EmptyState
              image={emptyStateImages.rest}
              title="Sua clínica digital"
              message="Compartilhe o código de vínculo em Pacientes. Quando alguém se conectar, o painel começa a mostrar aderência e registros."
            />
          </Card>
        ) : (
          <View className="mt-6 gap-2">
            <View className="w-full flex-row gap-2">
              <Card className="min-w-0 flex-1">
                <Text className="font-sansMed text-[10px] uppercase tracking-[1.5px] text-sleep-lavender">
                  Pacientes
                </Text>
                <Text className="mt-1 font-sansBold text-2xl text-sleep-rose">
                  {data.totalPatients}
                </Text>
              </Card>
              <Card className="min-w-0 flex-1">
                <Text className="font-sansMed text-[10px] uppercase tracking-[1.5px] text-sleep-lavender">
                  Hoje ok
                </Text>
                <Text className="mt-1 font-sansBold text-2xl text-sleep-accent">
                  {data.filledToday}
                </Text>
              </Card>
              <Card className="min-w-0 flex-1">
                <Text className="font-sansMed text-[10px] uppercase tracking-[1.5px] text-sleep-lavender">
                  Pendentes
                </Text>
                <Text className="mt-1 font-sansBold text-2xl text-sleep-ink">
                  {data.pendingToday}
                </Text>
              </Card>
            </View>

            <Text className="mt-2 font-sansMed text-xs uppercase tracking-[2px] text-sleep-muted">
              Atualizações recentes
            </Text>

            {data.updates.length === 0 ? (
              <Card className="mt-2">
                <EmptyState
                  image={emptyStateImages.ginkgo}
                  title="Semana tranquila"
                  message="Nenhum registro novo nesta semana. Quando alguém preencher o diário, aparece aqui."
                />
              </Card>
            ) : (
              data.updates.map((u) => (
                <Pressable
                  key={u.patient.patientUid}
                  onPress={() =>
                    router.push(
                      `/(professional)/patient/${u.patient.patientUid}`
                    )
                  }
                >
                  <Card>
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="min-w-0 flex-1">
                        <Text className="font-sansBold text-base text-sleep-ink">
                          {u.patient.displayName}
                        </Text>
                        <Text className="mt-1 font-sans text-sm text-sleep-muted leading-5">
                          {u.filledToday
                            ? "Registrou o dia de hoje"
                            : `Último registro: ${formatIsoDatePt(u.lastDay!.date)}`}
                        </Text>
                        <Text className="mt-1 font-sans text-xs text-sleep-lavender">
                          Semana {u.filledDays}/{u.expectedDays} dias
                        </Text>
                      </View>
                      <View
                        className={`rounded-full px-2.5 py-1 ${
                          u.filledToday
                            ? "bg-sleep-accentSoft"
                            : "bg-sleep-lavenderSoft"
                        }`}
                      >
                        <Text
                          className={`font-sansMed text-[11px] ${
                            u.filledToday
                              ? "text-sleep-accent"
                              : "text-sleep-lavender"
                          }`}
                        >
                          {u.filledToday ? "Hoje" : "Recente"}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))
            )}
          </View>
        )}
      </AppScrollView>
    </Screen>
  );
}
