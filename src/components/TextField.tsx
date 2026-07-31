import { Label } from "@/src/components/ui";
import { TextInput, View } from "react-native";

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "number-pad";
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words";
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry,
  multiline,
  autoCapitalize = "sentences",
}: Props) {
  return (
    <View className="mb-3.5">
      <Label>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7E779A"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        className={`rounded-2xl border border-sleep-line bg-sleep-bgDeep/70 px-3.5 py-3.5 font-sans text-base text-sleep-ink ${
          multiline ? "min-h-[96px]" : ""
        }`}
      />
    </View>
  );
}
