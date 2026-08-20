import { FieldHint, Label } from "@/src/components/ui";
import { TextField } from "@/src/components/TextField";
import { formQuestions } from "@/src/content/mapaDoSono";
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
        label={`${formQuestions.q0.label} (HH:mm)`}
        value={value.q0}
        onChangeText={(t) => set("q0", t)}
        placeholder="06:00"
        autoCapitalize="none"
      />
      <FieldHint>{formQuestions.q0.hint}</FieldHint>

      <TextField
        label={`${formQuestions.q1.label} (HH:mm)`}
        value={value.q1}
        onChangeText={(t) => set("q1", t)}
        placeholder="06:30"
        autoCapitalize="none"
      />
      <FieldHint>{formQuestions.q1.hint}</FieldHint>

      <TextField
        label={`${formQuestions.q2.label} (HH:mm)`}
        value={value.q2}
        onChangeText={(t) => set("q2", t)}
        placeholder="23:00"
        autoCapitalize="none"
      />
      <FieldHint>{formQuestions.q2.hint}</FieldHint>

      <TextField
        label={`${formQuestions.q3.label} (HH:mm)`}
        value={value.q3}
        onChangeText={(t) => set("q3", t)}
        placeholder="23:30"
        autoCapitalize="none"
      />
      <FieldHint>{formQuestions.q3.hint}</FieldHint>

      <TextField
        label={formQuestions.q4.label}
        value={String(value.q4 || "")}
        onChangeText={(t) => set("q4", parseIntSafe(t))}
        placeholder="30"
        keyboardType="number-pad"
      />
      <FieldHint>{formQuestions.q4.hint}</FieldHint>

      <TextField
        label={formQuestions.q5.label}
        value={String(value.q5 || "")}
        onChangeText={(t) => set("q5", parseIntSafe(t))}
        placeholder="0"
        keyboardType="number-pad"
      />
      <FieldHint>{formQuestions.q5.hint}</FieldHint>

      <TextField
        label={formQuestions.q6.label}
        value={(value.q6 || []).join(", ")}
        onChangeText={(t) => set("q6", parseMinutesList(t))}
        placeholder="10, 30, 15"
        autoCapitalize="none"
      />
      <FieldHint>{formQuestions.q6.hint}</FieldHint>

      <View className="mt-3">
        <TextField
          label={formQuestions.q7.label}
          value={String(value.q7 || "")}
          onChangeText={(t) => set("q7", parseIntSafe(t))}
          placeholder="360"
          keyboardType="number-pad"
        />
        <FieldHint>{formQuestions.q7.hint}</FieldHint>
      </View>

      <TextField
        label={formQuestions.q8.label}
        value={value.q8}
        onChangeText={(t) => set("q8", t)}
        placeholder="Ex.: 1 taça de vinho / nenhum"
      />
      <FieldHint>{formQuestions.q8.hint}</FieldHint>

      <TextField
        label={formQuestions.q9.label}
        value={value.q9}
        onChangeText={(t) => set("q9", t)}
        placeholder="Ex.: nenhum / dose e medicamento"
      />
      <FieldHint>{formQuestions.q9.hint}</FieldHint>

      <TextField
        label={formQuestions.q10.label}
        value={value.q10 || ""}
        onChangeText={(t) => set("q10", t)}
        placeholder="Opcional"
        multiline
      />
      <FieldHint>{formQuestions.q10.hint}</FieldHint>

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
              value === i ? "text-sleep-bg" : "text-sleep-rose"
            }`}
          >
            {i}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
