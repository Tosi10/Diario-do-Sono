import { ReactNode } from "react";
import {
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = {
  children: ReactNode;
  className?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: "always" | "handled" | "never";
};

/** Só rolagem vertical — sem scroll lateral. */
export function AppScrollView({
  children,
  className = "flex-1",
  contentContainerStyle,
  keyboardShouldPersistTaps = "handled",
}: Props) {
  return (
    <ScrollView
      className={className}
      style={{ width: "100%" }}
      contentContainerStyle={[
        { width: "100%", flexGrow: 1 },
        contentContainerStyle,
      ]}
      horizontal={false}
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      bounces
      overScrollMode="never"
    >
      {children}
    </ScrollView>
  );
}
