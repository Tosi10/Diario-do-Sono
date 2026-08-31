import { brand } from "@/src/theme/brand";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type AppAlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

type AlertPayload = {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
};

type Listener = (payload: AlertPayload | null) => void;

let listener: Listener | null = null;

/** API igual ao Alert.alert — modal na estética Sono à Vista. */
export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[]
) {
  if (!listener) {
    console.warn("AppAlertHost não montado; alert ignorado:", title);
    return;
  }
  listener({
    title,
    message,
    buttons: buttons?.length ? buttons : [{ text: "OK" }],
  });
}

export function AppAlertHost() {
  const [payload, setPayload] = useState<AlertPayload | null>(null);

  useEffect(() => {
    listener = setPayload;
    return () => {
      listener = null;
    };
  }, []);

  const close = useCallback(() => setPayload(null), []);

  const onButton = useCallback(
    (btn: AppAlertButton) => {
      close();
      requestAnimationFrame(() => btn.onPress?.());
    },
    [close]
  );

  if (!payload) return null;

  const buttons = payload.buttons?.length
    ? payload.buttons
    : [{ text: "OK" as const }];

  const dismissOnBackdrop =
    buttons.length === 1 && buttons[0]?.style !== "destructive";

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        {dismissOnBackdrop ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityLabel="Fechar"
          />
        ) : null}

        <View style={styles.card}>
          <LinearGradient
            colors={[brand.argila, brand.terra]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />

          <View style={styles.body}>
            <Text
              className="text-center font-display text-2xl text-sleep-ink"
              style={{ lineHeight: 32 }}
            >
              {payload.title}
            </Text>
            {payload.message ? (
              <Text className="mt-3 text-center font-sans text-[15px] leading-6 text-sleep-muted">
                {payload.message}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.actions,
              buttons.length > 1 ? styles.actionsRow : null,
            ]}
          >
            {buttons.map((btn, i) => {
              const isPrimary =
                btn.style !== "cancel" &&
                (buttons.length === 1 || i === buttons.length - 1);
              const isDestructive = btn.style === "destructive";

              if (isPrimary && !isDestructive) {
                return (
                  <Pressable
                    key={`${btn.text}-${i}`}
                    onPress={() => onButton(btn)}
                    style={[
                      styles.primaryWrap,
                      buttons.length > 1 ? styles.actionFlex : null,
                    ]}
                  >
                    <LinearGradient
                      colors={[brand.argila, brand.terra]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.primaryGradient}
                    >
                      <Text style={styles.primaryLabel}>{btn.text}</Text>
                    </LinearGradient>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={`${btn.text}-${i}`}
                  onPress={() => onButton(btn)}
                  style={[
                    styles.secondaryBtn,
                    buttons.length > 1 ? styles.actionFlex : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryLabel,
                      isDestructive ? styles.destructiveLabel : null,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(90, 56, 60, 0.42)",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 200, 180, 0.85)",
    backgroundColor: brand.card,
    shadowColor: brand.terraDeep,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 8,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    gap: 10,
  },
  actionsRow: {
    flexDirection: "row",
  },
  actionFlex: {
    flex: 1,
  },
  primaryWrap: {
    overflow: "hidden",
    borderRadius: 16,
  },
  primaryGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  primaryLabel: {
    textAlign: "center",
    fontFamily: "WorkSans_600SemiBold",
    fontSize: 15,
    color: brand.marfim,
  },
  secondaryBtn: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 200, 180, 0.9)",
    backgroundColor: "rgba(232, 224, 207, 0.55)",
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  secondaryLabel: {
    textAlign: "center",
    fontFamily: "WorkSans_500Medium",
    fontSize: 15,
    color: brand.rose,
  },
  destructiveLabel: {
    color: "#B85C5C",
  },
});
