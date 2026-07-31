import { Text } from "react-native";

export function TabLabel({
  label,
  focused,
}: {
  label: string;
  focused: boolean;
}) {
  return (
    <Text
      className={`text-[11px] tracking-wide ${
        focused
          ? "font-sansBold text-sleep-accent"
          : "font-sans text-sleep-muted"
      }`}
    >
      {label}
    </Text>
  );
}
