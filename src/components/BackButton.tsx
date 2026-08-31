import { brand } from "@/src/theme/brand";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onPress: () => void;
  label?: string;
};

/** Voltar editorial — pill compacto (largura do texto), visual no View interno. */
export function BackButton({ onPress, label = "Voltar" }: Props) {
  return (
    <View style={styles.outer}>
      <Pressable
        onPress={onPress}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <View style={styles.chip}>
          <Ionicons name="chevron-back" size={17} color={brand.argila} />
          <Text style={styles.label}>{label}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingLeft: 4,
    paddingRight: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212, 200, 180, 0.9)",
    backgroundColor: brand.card,
    shadowColor: brand.terraDeep,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
  },
  label: {
    fontFamily: "WorkSans_500Medium",
    fontSize: 13,
    letterSpacing: 0.3,
    color: brand.rose,
  },
});
