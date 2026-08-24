import { brand } from "@/src/theme/brand";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
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
      // Deixa o modal fechar antes do callback (navegação etc.)
      requestAnimationFrame(() => btn.onPress?.());
    },
    [close]
  );

  if (!payload) return null;

  const buttons = payload.buttons?.length
    ? payload.buttons
    : [{ text: "OK" as const }];

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View className="flex-1 items-center justify-center bg-sleep-ink/45 px-6">
        <View
          className="w-full max-w-sm overflow-hidden rounded-clay border border-sleep-line bg-sleep-card"
          style={{
            shadowColor: brand.terraDeep,
            shadowOpacity: 0.18,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
          }}
        >
          <View className="px-5 pt-6 pb-2">
            <Text className="text-center font-displayBold text-2xl text-sleep-ink">
              {payload.title}
            </Text>
            {payload.message ? (
              <Text className="mt-3 text-center font-sans text-[15px] leading-6 text-sleep-muted">
                {payload.message}
              </Text>
            ) : null}
          </View>

          <View
            className={`px-4 pb-4 pt-3 ${
              buttons.length > 1 ? "flex-row gap-2" : ""
            }`}
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
                    className={`overflow-hidden rounded-2xl ${
                      buttons.length > 1 ? "flex-1" : ""
                    }`}
                  >
                    <LinearGradient
                      colors={[brand.argila, brand.terra]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ paddingVertical: 13, paddingHorizontal: 14 }}
                    >
                      <Text className="text-center font-sansBold text-[15px] text-sleep-bg">
                        {btn.text}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={`${btn.text}-${i}`}
                  onPress={() => onButton(btn)}
                  className={`rounded-2xl border border-sleep-line bg-sleep-bgDeep/60 px-4 py-3.5 ${
                    buttons.length > 1 ? "flex-1" : ""
                  }`}
                >
                  <Text
                    className={`text-center font-sansMed text-[15px] ${
                      isDestructive ? "text-sleep-danger" : "text-sleep-rose"
                    }`}
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
