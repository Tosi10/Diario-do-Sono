import { BrandMark } from "@/src/components/BrandMark";
import {
  WEB_SIDEBAR_WIDTH,
  useIsWebSidebar,
} from "@/src/components/ContentFrame";
import { brand, brandCopy } from "@/src/theme/brand";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(routeName: string, focused: boolean): IconName {
  const map: Record<string, [IconName, IconName]> = {
    index: ["home", "home-outline"],
    week: ["moon", "moon-outline"],
    patients: ["people", "people-outline"],
    profile: ["person", "person-outline"],
  };
  const pair = map[routeName] ?? ["ellipse", "ellipse-outline"];
  return focused ? pair[0] : pair[1];
}

/**
 * Mobile: barra inferior com ícone + rótulo.
 * Web (≥900px): sidebar esquerda.
 */
export function AdaptiveTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const isSidebar = useIsWebSidebar();
  const insets = useSafeAreaInsets();

  const items = state.routes.filter((route) => {
    const opts = descriptors[route.key]?.options as
      | { href?: string | null }
      | undefined;
    if (opts?.href === null) return false;
    if (route.name.includes("patient/")) return false;
    if (route.name === "ocr-review") return false;
    if (route.name === "ocr") return false;
    if (route.name === "today") return false;
    return true;
  });

  if (isSidebar) {
    return (
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: WEB_SIDEBAR_WIDTH,
          backgroundColor: brand.terraDeep,
          borderRightWidth: 1,
          borderRightColor: "rgba(242,237,224,0.15)",
          paddingTop: 28,
          paddingBottom: 24,
          paddingHorizontal: 16,
        }}
      >
        <View className="mb-8 items-center px-2">
          <BrandMark variant="logoVertical" size="sm" />
          <Text className="mt-3 text-center font-sans text-[10px] uppercase tracking-[2px] text-sleep-lavender">
            {brandCopy.category}
          </Text>
        </View>

        <View className="gap-1.5">
          {items.map((route) => {
            const { options } = descriptors[route.key]!;
            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : options.title ?? route.name;
            const focused = state.routes[state.index]?.key === route.key;
            const color = focused ? brand.marfim : "rgba(242,237,224,0.7)";

            return (
              <Pressable
                key={route.key}
                onPress={() => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
                className={`flex-row items-center gap-3 rounded-2xl px-3 py-3 ${
                  focused ? "bg-sleep-accent/25" : "bg-transparent"
                }`}
              >
                <Ionicons
                  name={tabIcon(route.name, focused)}
                  size={20}
                  color={color}
                />
                <Text
                  className={`font-sansMed text-[15px] ${
                    focused ? "text-sleep-bg" : "text-sleep-bg/70"
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: brand.marfim,
        borderTopColor: brand.line,
        borderTopWidth: 1,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 10,
        height: 64 + Math.max(insets.bottom, 8),
      }}
    >
      {items.map((route) => {
        const { options } = descriptors[route.key]!;
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : options.title ?? route.name;
        const focused =
          state.index === state.routes.findIndex((r) => r.key === route.key);
        const color = focused ? brand.argila : brand.muted;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons
              name={tabIcon(route.name, focused)}
              size={22}
              color={color}
            />
            <Text
              className={`mt-1 text-[11px] tracking-wide ${
                focused
                  ? "font-sansBold text-sleep-accent"
                  : "font-sans text-sleep-muted"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
