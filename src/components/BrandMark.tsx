import { brandCopy } from "@/src/theme/brand";
import { Image, Text, View } from "react-native";

type Props = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

const sizes = {
  sm: 44,
  md: 72,
  lg: 120,
};

/** Selo oficial Ana Gonçalves (ginkgo). */
export function BrandMark({ size = "md", showWordmark = false }: Props) {
  const dim = sizes[size];
  return (
    <View className="items-center">
      <Image
        source={require("../../assets/brand/seal.png")}
        style={{ width: dim, height: dim }}
        resizeMode="contain"
      />
      {showWordmark ? (
        <View className="mt-4 items-center px-4">
          <Text className="text-center font-displayBold text-[28px] leading-8 text-sleep-ink">
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
