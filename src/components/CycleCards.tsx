import {
  Card,
  DangerBanner,
  InfoBanner,
  PrimaryButton,
} from "@/src/components/ui";
import { MIN_FILLED_DAYS } from "@/src/domain/cycleProtocol";
import type { SonoWeek } from "@/src/types";
import { Text, TextInput, View } from "react-native";

export function CycleOutcomeCard({ week }: { week: SonoWeek }) {
  const filled = week.filledDayIds.length;
  const missed = week.missedDayIds?.length ?? 0;

  if (week.status === "complete") {
    return (
      <Card className="border-sleep-ok/40 bg-[#E8F0E4]/90">
        <Text className="text-center font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-ok">
          Ciclo concluído
        </Text>
        <Text className="mt-2 text-center font-displayBold text-3xl text-sleep-ink">
          Parabéns!
        </Text>
        <Text className="mt-3 text-center font-sans text-sm leading-6 text-sleep-muted">
          Você chegou ao fim dos 7 dias com {filled} noites registradas
          {filled >= MIN_FILLED_DAYS
            ? " — o ciclo é válido para o acompanhamento."
            : "."}
        </Text>
        <View className="mt-4 flex-row justify-center gap-2">
          <View className="h-2 w-2 rounded-full bg-sleep-accent" />
          <View className="h-2 w-2 rounded-full bg-sleep-lavender" />
          <View className="h-2 w-2 rounded-full bg-sleep-accent" />
        </View>
      </Card>
    );
  }

  if (week.status === "failed") {
    return (
      <View className="gap-2">
        <DangerBanner>
          Ciclo encerrado: não foi possível completar o mínimo de{" "}
          {MIN_FILLED_DAYS} dias preenchidos (perdidos: {missed}).
        </DangerBanner>
        <InfoBanner>
          Isso faz parte do método. A profissional vê este ciclo no histórico e
          pode orientar o próximo. Se precisar corrigir um dia, fale com ela.
        </InfoBanner>
      </View>
    );
  }

  return null;
}

export function CycleWakeSetupCard({
  wakeDraft,
  onChangeDraft,
  onConfirm,
  saving,
}: {
  wakeDraft: string;
  onChangeDraft: (v: string) => void;
  onConfirm: () => void;
  saving?: boolean;
}) {
  return (
    <Card>
      <Text className="font-sansMed text-[11px] uppercase tracking-[2px] text-sleep-lavender">
        Início do ciclo
      </Text>
      <Text className="mt-2 font-displayBold text-2xl text-sleep-ink">
        Hora de acordar desta semana
      </Text>
      <Text className="mt-2 font-sans text-sm leading-5 text-sleep-muted">
        Para o tratamento e os cálculos fazerem sentido, escolha o horário em
        que você vai acordar nos próximos 7 dias. Depois de confirmar, ele{" "}
        <Text className="font-sansMed text-sleep-ink">não pode ser mudado</Text>{" "}
        neste ciclo.
      </Text>
      <Text className="mt-4 font-sansMed text-sm text-sleep-rose">
        Horário (HH:mm)
      </Text>
      <TextInput
        value={wakeDraft}
        onChangeText={onChangeDraft}
        placeholder="07:00"
        placeholderTextColor="#8A6A6E"
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        className="mt-1.5 rounded-2xl border border-sleep-line bg-sleep-bgDeep/50 px-4 py-3 font-sans text-lg text-sleep-ink"
      />
      <Text className="mt-2 font-sans text-xs text-sleep-muted">
        A janela de preenchimento abre na hora de acordar e fecha 5 horas
        depois (Brasília). Se você já salvar o dia, os lembretes daquele dia
        são cancelados.
      </Text>
      <View className="mt-4">
        <PrimaryButton
          label={saving ? "Salvando…" : "Confirmar hora do ciclo"}
          onPress={onConfirm}
          disabled={saving}
        />
      </View>
    </Card>
  );
}
