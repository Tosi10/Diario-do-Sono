import { brand } from "@/src/theme/brand";
import { ReactNode } from "react";
import { Platform, useWindowDimensions, View } from "react-native";

/** Conteúdo limitado na web (evita campos esticados). */
export function ContentFrame({
  children,
  maxWidth = 720,
  className = "",
}: {
  children: ReactNode;
  maxWidth?: number;
  className?: string;
}) {
  const { width } = useWindowDimensions();
  const constrain = Platform.OS === "web" && width >= 768;

  return (
    <View
      className={`flex-1 w-full self-center overflow-hidden ${className}`}
      style={
        constrain
          ? { maxWidth, width: "100%", alignSelf: "center", overflow: "hidden" }
          : { width: "100%", overflow: "hidden" }
      }
    >
      {children}
    </View>
  );
}

export function useIsWebSidebar(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= 900;
}

export const WEB_SIDEBAR_WIDTH = 248;

export const webSidebarColors = {
  bg: brand.indigoDeep,
  border: brand.line,
  active: brand.sage,
  muted: brand.muted,
  ink: brand.ink,
} as const;
