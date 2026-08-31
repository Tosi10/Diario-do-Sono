import { brand } from "@/src/theme/brand";
import { ReactNode } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

export const emptyStateImages = {
  ginkgo: require("../../assets/brand/empty-ginkgo.jpg"),
  rest: require("../../assets/brand/empty-rest.jpg"),
} as const satisfies Record<string, ImageSourcePropType>;

type Props = {
  title: string;
  message: string;
  image?: ImageSourcePropType;
  compact?: boolean;
  children?: ReactNode;
};

/** Estado vazio editorial — foto suave + tipografia Bethany. */
export function EmptyState({
  title,
  message,
  image,
  compact = false,
  children,
}: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {image ? (
        <View
          style={[
            styles.imageFrame,
            compact && styles.imageFrameCompact,
          ]}
        >
          <Image source={image} style={styles.image} resizeMode="cover" />
        </View>
      ) : null}
      <Text
        className={`text-center font-display text-sleep-ink ${
          compact ? "text-lg" : "text-xl"
        }`}
        style={{ lineHeight: compact ? 24 : 28 }}
      >
        {title}
      </Text>
      <Text className="mt-2 text-center font-sans text-sm leading-5 text-sleep-muted">
        {message}
      </Text>
      {children ? <View className="mt-4 w-full">{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  wrapCompact: {
    paddingVertical: 4,
  },
  imageFrame: {
    width: "100%",
    maxWidth: 280,
    height: 120,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 200, 180, 0.7)",
    shadowColor: brand.terraDeep,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageFrameCompact: {
    height: 88,
    marginBottom: 12,
    borderRadius: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
