import { cycleStatusLabel } from "@/src/domain/cycleProtocol";
import { formatIsoDatePt } from "@/src/domain/timeHelpers";
import type { SonoWeek } from "@/src/types";
import { Pressable, Text, View } from "react-native";

export function CycleHistoryList({
  weeks,
  selectedWeekId,
  onSelect,
}: {
  weeks: SonoWeek[];
  selectedWeekId?: string;
  onSelect: (week: SonoWeek) => void;
}) {
  if (!weeks.length) {
    return (
      <Text className="font-sans text-sm text-sleep-muted">
        Nenhum ciclo registrado ainda.
      </Text>
    );
  }

  return (
    <View>
      {weeks.map((w, i) => {
        const filled = w.filledDayIds.length;
        const missed = w.missedDayIds?.length ?? 0;
        const selected = w.weekId === selectedWeekId;
        return (
          <Pressable
            key={w.weekId}
            onPress={() => onSelect(w)}
            className={`py-3 ${
              i < weeks.length - 1 ? "border-b border-sleep-line" : ""
            }`}
          >
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1">
                <Text
                  className={`font-sansMed ${
                    selected ? "text-sleep-accent" : "text-sleep-ink"
                  }`}
                >
                  {formatIsoDatePt(w.startDate)} — {formatIsoDatePt(w.endDate)}
                </Text>
                <Text className="mt-0.5 font-sans text-xs text-sleep-muted">
                  {cycleStatusLabel(w.status)} · {filled}/7 preenchidos
                  {missed ? ` · ${missed} perdidos` : ""}
                  {w.wakeTime ? ` · acordar ${w.wakeTime}` : ""}
                </Text>
              </View>
              <Text className="font-sansMed text-xs text-sleep-accent">
                {selected ? "Atual" : "Abrir"}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
