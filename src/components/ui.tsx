import { brand } from "@/src/theme/brand";
import { ContentFrame } from "@/src/components/ContentFrame";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Screen({
  children,
  className = "",
  edges = "both",
  contentMaxWidth = 720,
}: {
  children: ReactNode;
  className?: string;
  edges?: "both" | "top" | "none";
  contentMaxWidth?: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={`flex-1 bg-sleep-bg ${className}`}
      style={{
        // Em telas com tab bar use edges="top": o bottom inset fica na barra,
        // senão aparece uma faixa vazia (fundo) entre o conteúdo e as abas.
        paddingTop: edges === "none" ? 0 : insets.top,
        paddingBottom: edges === "top" || edges === "none" ? 0 : insets.bottom,
      }}
    >
      <LinearGradient
        colors={[brand.marfim, brand.areia, "#E8DFCF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      {/* Textura linho sutil */}
      <View
        pointerEvents="none"
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundColor: "transparent",
          borderWidth: 0,
        }}
      />
      <View
        pointerEvents="none"
        className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-sleep-lavender/25"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-8 -left-12 h-48 w-48 rounded-full bg-sleep-accent/15"
      />
      <ContentFrame maxWidth={contentMaxWidth} className="flex-1">
        {children}
      </ContentFrame>
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Text className="font-sansMed text-[11px] uppercase tracking-[3px] text-sleep-lavender">
      {children}
    </Text>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <Text className="font-displayBold text-[34px] leading-10 text-sleep-ink tracking-tight">
      {children}
    </Text>
  );
}

export function Subtitle({ children }: { children: ReactNode }) {
  return (
    <Text className="mt-2 font-sans text-[15px] leading-6 text-sleep-muted">
      {children}
    </Text>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`rounded-clay border border-sleep-line/90 bg-sleep-card/95 px-4 py-4 ${className}`}
      style={{
        shadowColor: brand.terraDeep,
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      }}
    >
      {children}
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Text className="mb-1.5 font-sansMed text-sm text-sleep-rose">
      {children}
    </Text>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return (
    <Text className="mt-1 font-sans text-xs text-sleep-muted">{children}</Text>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`overflow-hidden rounded-2xl ${disabled ? "opacity-45" : ""}`}
    >
      <LinearGradient
        colors={
          disabled
            ? [brand.line, brand.line]
            : [brand.argila, brand.terra]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingVertical: 15, paddingHorizontal: 16 }}
      >
        <Text className="text-center font-sansBold text-[15px] text-sleep-bg">
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl border border-sleep-rose/25 bg-sleep-lavenderSoft/80 px-4 py-3.5"
    >
      <Text className="text-center font-sansMed text-[15px] text-sleep-rose">
        {label}
      </Text>
    </Pressable>
  );
}

export function DangerBanner({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-2xl border border-sleep-danger/35 bg-[#F3E0DC] px-3.5 py-3">
      <Text className="font-sansMed text-sm text-sleep-danger leading-5">
        {children}
      </Text>
    </View>
  );
}

export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-2xl border border-sleep-lavender/40 bg-sleep-lavenderSoft/90 px-3.5 py-3">
      <Text className="font-sans text-sm text-sleep-ink leading-5">
        {children}
      </Text>
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text className="mb-2 font-sansMed text-xs uppercase tracking-[2px] text-sleep-muted">
      {children}
    </Text>
  );
}
