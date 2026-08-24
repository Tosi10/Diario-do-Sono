import {
  FILL_CLOSE_WARNING_MIN,
  FILL_OPEN_OFFSET_MIN,
  FILL_WINDOW_MINUTES,
} from "@/src/constants/collections";
import {
  formatHHmm,
  parseTimeToMinutes,
  weekDateList,
} from "@/src/domain/timeHelpers";
import type { IsoDate, SonoWeek, TimeHHmm } from "@/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

const STORAGE_KEY = "sono.cycleNotificationIds.v1";

type NotificationsModule = typeof import("expo-notifications");

let notificationsMod: NotificationsModule | null | undefined;
let handlerReady = false;

/**
 * Expo Go (SDK 53+) não suporta push Android e loga ERROR no import.
 * Só carregamos o módulo em development build / APK.
 */
async function getNotifications(): Promise<NotificationsModule | null> {
  if (isRunningInExpoGo()) return null;
  if (Platform.OS !== "android" && Platform.OS !== "ios") return null;
  if (notificationsMod !== undefined) return notificationsMod;

  try {
    const mod = await import("expo-notifications");
    if (!handlerReady) {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerReady = true;
    }
    notificationsMod = mod;
    return mod;
  } catch {
    notificationsMod = null;
    return null;
  }
}

type StoredIds = Record<string, string[]>;

async function readStore(): Promise<StoredIds> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StoredIds;
  } catch {
    return {};
  }
}

async function writeStore(data: StoredIds) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Interpreta data+hora de Brasília (sem horário de verão desde 2019). */
export function clinicDateTime(isoDate: IsoDate, time: TimeHHmm): Date {
  return new Date(`${isoDate}T${time}:00-03:00`);
}

/** Local schedule só fora do Expo Go (APK / development build). */
export function isPushSupported(): boolean {
  if (isRunningInExpoGo()) return false;
  return Platform.OS === "android" || Platform.OS === "ios";
}

export function isDayFilled(week: SonoWeek, dateIso: IsoDate): boolean {
  return (week.filledDayIds ?? []).some(
    (id) => id === dateIso || id.endsWith(`_${dateIso}`)
  );
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function cancelIds(
  Notifications: NotificationsModule,
  ids: string[]
) {
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)
    )
  );
}

export async function cancelCycleNotifications(weekId: string): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  const store = await readStore();
  const ids = store[weekId] ?? [];
  await cancelIds(Notifications, ids);
  delete store[weekId];
  await writeStore(store);
}

/**
 * Agenda lembretes só para dias ainda sem registro:
 * - wakeTime + 10 min: preencher
 * - wakeTime + 5h − 10 min: aviso de fechamento
 *
 * Se o paciente já salvou o dia (mesmo antes do 1º push), esse dia é
 * pulado — cancela o que ainda faltava daquele dia.
 */
export async function scheduleCycleNotifications(
  week: SonoWeek
): Promise<number> {
  const Notifications = await getNotifications();
  if (!Notifications) return 0;
  if (!week.wakeTime || week.status !== "open") return 0;

  const granted = await ensureNotificationPermission();
  if (!granted) return 0;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("ciclo-diario", {
      name: "Diário do ciclo",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  await cancelCycleNotifications(week.weekId);

  const wake = parseTimeToMinutes(week.wakeTime);
  if (wake === null) return 0;

  const openTime = formatHHmm(wake + FILL_OPEN_OFFSET_MIN);
  const warnTime = formatHHmm(
    wake + FILL_WINDOW_MINUTES - FILL_CLOSE_WARNING_MIN
  );
  const closeTime = formatHHmm(wake + FILL_WINDOW_MINUTES);

  const now = Date.now();
  const ids: string[] = [];

  for (const date of weekDateList(week.startDate)) {
    if (isDayFilled(week, date)) continue;

    const openAt = clinicDateTime(date, openTime);
    if (openAt.getTime() > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Sono à Vista",
          body: "Hora de preencher o diário de hoje.",
          sound: true,
          data: { weekId: week.weekId, date, kind: "open" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: openAt,
          channelId: Platform.OS === "android" ? "ciclo-diario" : undefined,
        },
      });
      ids.push(id);
    }

    const warnAt = clinicDateTime(date, warnTime);
    if (warnAt.getTime() > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Sono à Vista",
          body: `Faltam 10 minutos para fechar o dia (até ${closeTime}).`,
          sound: true,
          data: { weekId: week.weekId, date, kind: "warn" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: warnAt,
          channelId: Platform.OS === "android" ? "ciclo-diario" : undefined,
        },
      });
      ids.push(id);
    }
  }

  const store = await readStore();
  store[week.weekId] = ids;
  await writeStore(store);
  return ids.length;
}

/** Após salvar o dia: cancela pushes daquele dia e reagenda só o que falta. */
export async function rescheduleAfterDaySaved(week: SonoWeek): Promise<void> {
  if (week.status !== "open" || !week.wakeTime) {
    await cancelCycleNotifications(week.weekId);
    return;
  }
  await scheduleCycleNotifications(week);
}
