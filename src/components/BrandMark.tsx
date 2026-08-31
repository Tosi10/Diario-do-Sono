import { brandCopy } from "@/src/theme/brand";
import { Image, Text, View } from "react-native";

type Props = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  /** selo = ginkgo circular; logoVertical = lockup claro (login/hero) */
  variant?: "seal" | "logoVertical";
};

const sealSizes = {
  sm: 44,
  md: 72,
  lg: 120,
};

const logoVerticalWidths = {
  sm: 120,
  md: 168,
  lg: 220,
};

/** Marca oficial Ana Gonçalves — selo ou logo vertical. */
export function BrandMark({
  size = "md",
  showWordmark = false,
  variant = "seal",
}: Props) {
  if (variant === "logoVertical") {
    const width = logoVerticalWidths[size];
    const height = Math.round(width * 1.35);
    return (
      <View className="items-center">
        <Image
          source={require("../../assets/brand/logo-vertical-claro.png")}
          style={{ width, height }}
          resizeMode="contain"
        />
      </View>
    );
  }

  const dim = sealSizes[size];
  return (
    <View className="items-center">
      <Image
        source={require("../../assets/brand/seal.png")}
        style={{ width: dim, height: dim }}
        resizeMode="contain"
      />
      {showWordmark ? (
        <View className="mt-4 items-center px-4">
          <Text className="text-center font-display text-[28px] leading-8 text-sleep-ink">
            {brandCopy.name}
          </Text>
          <Text className="mt-2 text-center font-sansMed text-[11px] uppercase tracking-[3px] text-sleep-lavender">
            {brandCopy.category}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
