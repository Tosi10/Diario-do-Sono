import { brand } from "@/src/theme/brand";
import { BrandMark } from "@/src/components/BrandMark";
import { BackButton } from "@/src/components/BackButton";
import { ContentFrame } from "@/src/components/ContentFrame";
import { SegmentTabs } from "@/src/components/SegmentTabs";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SoftAtmosphere() {
  return (
    <View pointerEvents="none" style={styles.atmosphereRoot}>
      <LinearGradient
        colors={[brand.marfim, brand.marfimDeep, brand.areia]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.washOliva} />
      <View style={styles.washArgila} />
    </View>
  );
}

export function Screen({
  children,
  className = "",
  edges = "both",
  contentMaxWidth = 720,
  atmosphere = "plain",
}: {
  children: ReactNode;
  className?: string;
  edges?: "both" | "top" | "none";
  contentMaxWidth?: number;
  /** plain = gradiente marca · soft = paleta clínica, sem foto */
  atmosphere?: "plain" | "soft";
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={`flex-1 ${atmosphere === "soft" ? "" : "bg-sleep-bg"} ${className}`}
      style={{
        backgroundColor: atmosphere === "soft" ? brand.marfim : undefined,
        // Em telas com tab bar use edges="top": o bottom inset fica na barra,
        // senão aparece uma faixa vazia (fundo) entre o conteúdo e as abas.
        paddingTop:
          edges === "none"
            ? 0
            : Math.max(insets.top, Platform.OS === "android" ? 28 : 0) + 10,
        paddingBottom: edges === "top" || edges === "none" ? 0 : insets.bottom,
      }}
    >
      {atmosphere === "soft" ? (
        <SoftAtmosphere />
      ) : (
        <>
          <LinearGradient
            colors={[brand.marfim, brand.marfimDeep, brand.areia]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View
            pointerEvents="none"
            className="absolute -right-20 top-24 h-64 w-64 rounded-full bg-sleep-lavender/12"
          />
          <View
            pointerEvents="none"
            className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-sleep-accent/10"
          />
        </>
      )}
      <ContentFrame maxWidth={contentMaxWidth} className="flex-1 z-10">
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
    <Text
      className="font-display text-[34px] text-sleep-ink tracking-tight"
      style={{ lineHeight: 44, paddingTop: 4 }}
    >
      {children}
    </Text>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  onBack,
  backLabel = "Voltar",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <View className="pb-1">
      {onBack ? (
        <BackButton onPress={onBack} label={backLabel} />
      ) : null}
      {eyebrow ? (
        <View className="mb-1.5">
          {typeof eyebrow === "string" ? <Eyebrow>{eyebrow}</Eyebrow> : eyebrow}
        </View>
      ) : null}
      <Title>{title}</Title>
      {subtitle ? (
        typeof subtitle === "string" ? (
          <Subtitle>{subtitle}</Subtitle>
        ) : (
          subtitle
        )
      ) : null}
    </View>
  );
}

export { BackButton } from "@/src/components/BackButton";
export { SegmentTabs } from "@/src/components/SegmentTabs";

/** Padding padrão do conteúdo rolável (safe area já vem do Screen). */
export const screenScrollContent = { paddingBottom: 40 } as const;

export function GreetingBlock({
  eyebrow,
  name,
}: {
  eyebrow: string;
  name: string;
}) {
  return (
    <View className="mb-5 items-center">
      <BrandMark size="sm" />
      <View className="mt-3 items-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Text
          className="mt-2 text-center font-display text-2xl text-sleep-ink"
          style={{ lineHeight: 32 }}
        >
          Olá, {name}
        </Text>
      </View>
    </View>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Text
      className={`font-display text-xl text-sleep-ink ${className}`}
      style={{ lineHeight: 28 }}
    >
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
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-2xl border border-sleep-rose/25 bg-sleep-lavenderSoft/80 px-4 py-3.5 ${
        disabled ? "opacity-50" : ""
      }`}
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

const styles = StyleSheet.create({
  atmosphereRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  washOliva: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(163, 157, 121, 0.16)",
    top: 96,
    right: -110,
  },
  washArgila: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(173, 102, 92, 0.10)",
    bottom: 24,
    left: -90,
  },
});
