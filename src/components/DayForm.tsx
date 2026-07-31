import { FieldHint, Label } from "@/src/components/ui";
import { TextField } from "@/src/components/TextField";
import type { SleepDayInput } from "@/src/types";
import { Pressable, Text, View } from "react-native";

type Props = {
  value: SleepDayInput;
  onChange: (next: SleepDayInput) => void;
  disabled?: boolean;
};

function parseIntSafe(raw: string): number {
  const n = parseInt(raw.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function parseMinutesList(raw: string): number[] {
  return raw
    .split(/[,;\s]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => parseIntSafe(p))
    .filter((n) => n >= 0);
}

export function DayForm({ value, onChange, disabled }: Props) {
  const set = <K extends keyof SleepDayInput>(key: K, v: SleepDayInput[K]) => {
    if (disabled) return;
    onChange({ ...value, [key]: v });
  };

  return (
    <View>
      <TextField
        label="0. A que horas você acordou? (HH:mm)"
        value={value.q0}
        onChangeText={(t) => set("q0", t)}
        placeholder="06:00"
        autoCapitalize="none"
      />
      <TextField
        label="1. A que horas saiu da cama? (HH:mm)"
        value={value.q1}
        onChangeText={(t) => set("q1", t)}
        placeholder="06:30"
        autoCapitalize="none"
      />
      <TextField
        label="2. Foi para a cama a noite passada? (HH:mm)"
        value={value.q2}
        onChangeText={(t) => set("q2", t)}
        placeholder="23:00"
        autoCapitalize="none"
      />
      <TextField
        label="3. Decidiu tentar dormir? (HH:mm)"
        value={value.q3}
        onChangeText={(t) => set("q3", t)}
        placeholder="23:30"
        autoCapitalize="none"
      />
      <TextField
        label="4. Quanto tempo levou para iniciar o sono? (min)"
        value={String(value.q4 || "")}
        onChangeText={(t) => set("q4", parseIntSafe(t))}
        placeholder="30"
        keyboardType="number-pad"
      />
      <TextField
        label="5. Quantas vezes despertou? (sem o final)"
        value={String(value.q5 || "")}
        onChangeText={(t) => set("q5", parseIntSafe(t))}
        placeholder="0"
        keyboardType="number-pad"
      />
      <TextField
        label="6. Duração de cada despertar (min, separados por vírgula)"
        value={(value.q6 || []).join(", ")}
        onChangeText={(t) => set("q6", parseMinutesList(t))}
        placeholder="10, 30, 15"
        autoCapitalize="none"
      />
      <FieldHint>A soma vira o TA (tempo acordado no meio do sono).</FieldHint>

      <View className="mt-3">
        <TextField
          label="7. Ao todo, quanto tempo dormiu? (minutos)"
          value={String(value.q7 || "")}
          onChangeText={(t) => set("q7", parseIntSafe(t))}
          placeholder="360"
          keyboardType="number-pad"
        />
        <FieldHint>Ex.: 6h = 360 minutos.</FieldHint>
      </View>

      <TextField
        label="8. Álcool na noite passada?"
        value={value.q8}
        onChangeText={(t) => set("q8", t)}
        placeholder="Ex.: 1 taça de vinho / nenhum"
      />
      <TextField
        label="9. Comprimidos para dormir?"
        value={value.q9}
        onChangeText={(t) => set("q9", t)}
        placeholder="Ex.: nenhum / 1 Stillnox"
      />
      <TextField
        label="10. Comentários (se necessário)"
        value={value.q10 || ""}
        onChangeText={(t) => set("q10", t)}
        placeholder="Opcional"
        multiline
      />

      <View className="mt-2 mb-2">
        <Label>Qualidade — quanto se sente bem esta manhã?</Label>
        <ScaleRow
          value={value.qualityFeel}
          onChange={(n) => set("qualityFeel", n)}
          disabled={disabled}
        />
      </View>
      <View className="mb-2">
        <Label>Qualidade — quanto aproveitou o sono?</Label>
        <ScaleRow
          value={value.qualityEnjoy}
          onChange={(n) => set("qualityEnjoy", n)}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

function ScaleRow({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <View className="mt-2 w-full flex-row flex-wrap justify-between gap-y-1.5">
      {Array.from({ length: 11 }, (_, i) => (
        <Pressable
          key={i}
          disabled={disabled}
          onPress={() => onChange(i)}
          className={`h-9 w-[8.5%] items-center justify-center rounded-lg border ${
            value === i
              ? "border-sleep-accent bg-sleep-accent"
              : "border-sleep-line bg-sleep-bgDeep/60"
          }`}
        >
          <Text
            className={`font-sansMed text-sm ${
              value === i ? "text-sleep-bgDeep" : "text-sleep-rose"
            }`}
          >
            {i}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
