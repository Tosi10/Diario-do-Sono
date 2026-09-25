import { useScrollReveal } from "@/src/components/AppScrollView";
import { Label } from "@/src/components/ui";
import { brand } from "@/src/theme/brand";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

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
  const reveal = useScrollReveal();
  const anchorRef = useRef<View>(null);
  const [hidden, setHidden] = useState(true);

  const onFocus = () => {
    reveal?.remember(anchorRef.current);
    setTimeout(() => reveal?.reveal(anchorRef.current), 280);
  };

  return (
    <View ref={anchorRef} className="mb-3.5" collapsable={false}>
      <Label>{label}</Label>
      <View style={styles.field}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8A6A6E"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry ? hidden : false}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          autoCorrect={secureTextEntry ? false : undefined}
          onFocus={onFocus}
          className={`rounded-2xl border border-sleep-line bg-sleep-bgDeep/70 px-3.5 py-3.5 font-sans text-base text-sleep-ink ${
            multiline ? "min-h-[96px]" : ""
          }`}
          style={secureTextEntry ? styles.secureInput : undefined}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
            style={styles.eye}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={brand.argila}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    justifyContent: "center",
  },
  secureInput: {
    paddingRight: 48,
  },
  eye: {
    position: "absolute",
    right: 6,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
