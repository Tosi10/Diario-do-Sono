import { brand } from "@/src/theme/brand";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function SegmentTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.tab, selected ? styles.tabSelected : null]}
          >
            <Text
              className="text-center font-sansMed text-[11px] leading-4"
              style={{ color: selected ? brand.rose : brand.muted }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 200, 180, 0.8)",
    backgroundColor: "rgba(232, 224, 207, 0.45)",
    padding: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
  },
  tabSelected: {
    backgroundColor: brand.card,
    shadowColor: brand.terraDeep,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
