import { PrimaryButton, SecondaryButton } from "@/src/components/ui";
import { brand } from "@/src/theme/brand";
import { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type StatItem = { label: string; value: string | number; emphasize?: boolean };

/** Uma faixa de números — sem três cards iguais. */
export function ClinicStatsStrip({ items }: { items: StatItem[] }) {
  return (
    <View style={styles.statsStrip}>
      {items.map((item, i) => (
        <View key={item.label} style={styles.statsCell}>
          {i > 0 ? <View style={styles.statsDivider} /> : null}
          <View style={styles.statsInner}>
            <Text style={styles.statsLabel}>{item.label}</Text>
            <Text
              style={[
                styles.statsValue,
                item.emphasize ? styles.statsValueAccent : null,
              ]}
            >
              {item.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Callout do dia — pedidos aguardando (diferente de card comum). */
export function PendingCallout({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.callout}>
      <View style={styles.calloutBar} />
      <View style={styles.calloutBody}>
        <Text style={styles.calloutEyebrow}>Aguardando você</Text>
        <Text style={styles.calloutTitle}>
          {count === 1
            ? "1 pedido de vínculo"
            : `${count} pedidos de vínculo`}
        </Text>
        <Text style={styles.calloutHint}>
          Toque para aprovar ou recusar em Pacientes.
        </Text>
      </View>
    </Pressable>
  );
}

export function PendingRequestCard({
  name,
  email,
  requestedLabel,
  busy,
  onApprove,
  onReject,
}: {
  name: string;
  email: string;
  requestedLabel?: string;
  busy?: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <View style={styles.pendingCard}>
      <View style={styles.pendingBar} />
      <View style={styles.pendingBody}>
        <Text style={styles.pendingName}>{name}</Text>
        <Text style={styles.pendingEmail}>{email}</Text>
        {requestedLabel ? (
          <Text style={styles.pendingMeta}>{requestedLabel}</Text>
        ) : null}
        <View style={styles.pendingActions}>
          <View style={styles.pendingActionFlex}>
            <SecondaryButton
              label="Recusar"
              onPress={onReject}
              disabled={busy}
            />
          </View>
          <View style={styles.pendingActionFlex}>
            <PrimaryButton
              label={busy ? "…" : "Aprovar"}
              onPress={onApprove}
              disabled={busy}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

/** Linha leve de paciente ativo — progresso + Gerir alinhados no fim. */
export function ActivePatientRow({
  name,
  email,
  progress,
  onOpen,
  onManage,
}: {
  name: string;
  email: string;
  progress: string;
  onOpen: () => void;
  onManage: () => void;
}) {
  return (
    <View style={styles.activeRow}>
      <Pressable onPress={onOpen} style={styles.activeMain}>
        <Text style={styles.activeName}>{name}</Text>
        <Text style={styles.activeEmail}>{email}</Text>
      </Pressable>
      <View style={styles.activeAside}>
        <Text style={styles.activeProgress}>{progress}</Text>
        <Pressable onPress={onManage} hitSlop={6} style={styles.manageChip}>
          <Text style={styles.manageLabel}>Gerir</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function UpdateRow({
  name,
  detail,
  meta,
  badge,
  badgeTone = "muted",
  onPress,
}: {
  name: string;
  detail: string;
  meta?: string;
  badge: string;
  badgeTone?: "accent" | "muted";
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.updateRow}>
      <View style={styles.updateMain}>
        <Text style={styles.updateName}>{name}</Text>
        <Text style={styles.updateDetail}>{detail}</Text>
        {meta ? <Text style={styles.updateMeta}>{meta}</Text> : null}
      </View>
      <View
        style={[
          styles.updateBadge,
          badgeTone === "accent"
            ? styles.updateBadgeAccent
            : styles.updateBadgeMuted,
        ]}
      >
        <Text
          style={[
            styles.updateBadgeText,
            badgeTone === "accent"
              ? styles.updateBadgeTextAccent
              : styles.updateBadgeTextMuted,
          ]}
        >
          {badge}
        </Text>
      </View>
    </Pressable>
  );
}

export function ClinicSectionLabel({
  children,
  trailing,
}: {
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  statsStrip: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 200, 180, 0.9)",
    backgroundColor: "rgba(250, 247, 240, 0.94)",
    overflow: "hidden",
    paddingVertical: 14,
    shadowColor: brand.terraDeep,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statsCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statsDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "rgba(120, 73, 78, 0.22)",
    marginVertical: 4,
  },
  statsInner: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  statsLabel: {
    fontFamily: "WorkSans_500Medium",
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: brand.olivaDeep,
  },
  statsValue: {
    marginTop: 4,
    fontFamily: "BethanyElingston",
    fontSize: 28,
    lineHeight: 34,
    color: brand.terra,
  },
  statsValueAccent: {
    color: brand.argila,
  },
  callout: {
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(173, 102, 92, 0.35)",
    backgroundColor: "rgba(250, 247, 240, 0.97)",
    shadowColor: brand.terraDeep,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  calloutBar: {
    width: 5,
    backgroundColor: brand.argila,
  },
  calloutBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  calloutEyebrow: {
    fontFamily: "WorkSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: brand.argila,
  },
  calloutTitle: {
    marginTop: 6,
    fontFamily: "BethanyElingston",
    fontSize: 24,
    lineHeight: 30,
    color: brand.ink,
  },
  calloutHint: {
    marginTop: 4,
    fontFamily: "WorkSans_400Regular",
    fontSize: 13,
    lineHeight: 18,
    color: brand.muted,
  },
  pendingCard: {
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(173, 102, 92, 0.28)",
    backgroundColor: "rgba(250, 247, 240, 0.96)",
    shadowColor: brand.terraDeep,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pendingBar: {
    width: 4,
    backgroundColor: brand.argila,
  },
  pendingBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pendingName: {
    fontFamily: "WorkSans_700Bold",
    fontSize: 17,
    color: brand.ink,
  },
  pendingEmail: {
    marginTop: 4,
    fontFamily: "WorkSans_400Regular",
    fontSize: 13,
    color: brand.muted,
  },
  pendingMeta: {
    marginTop: 4,
    fontFamily: "WorkSans_400Regular",
    fontSize: 12,
    color: brand.olivaDeep,
  },
  pendingActions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  pendingActionFlex: {
    flex: 1,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 200, 180, 0.85)",
    backgroundColor: "rgba(250, 247, 240, 0.95)",
  },
  activeMain: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  activeName: {
    fontFamily: "WorkSans_600SemiBold",
    fontSize: 16,
    color: brand.ink,
  },
  activeEmail: {
    marginTop: 3,
    fontFamily: "WorkSans_400Regular",
    fontSize: 13,
    color: brand.muted,
  },
  activeAside: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activeProgress: {
    fontFamily: "BethanyElingston",
    fontSize: 20,
    lineHeight: 24,
    color: brand.terra,
    minWidth: 36,
    textAlign: "right",
  },
  manageChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(120, 73, 78, 0.3)",
    backgroundColor: brand.areia,
  },
  manageLabel: {
    fontFamily: "WorkSans_600SemiBold",
    fontSize: 13,
    color: brand.terra,
  },
  updateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 200, 180, 0.8)",
    backgroundColor: "rgba(250, 247, 240, 0.95)",
  },
  updateMain: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  updateName: {
    fontFamily: "WorkSans_600SemiBold",
    fontSize: 15,
    color: brand.ink,
  },
  updateDetail: {
    marginTop: 3,
    fontFamily: "WorkSans_400Regular",
    fontSize: 13,
    lineHeight: 18,
    color: brand.muted,
  },
  updateMeta: {
    marginTop: 3,
    fontFamily: "WorkSans_400Regular",
    fontSize: 11,
    color: brand.olivaDeep,
  },
  updateBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  updateBadgeAccent: {
    backgroundColor: "rgba(173, 102, 92, 0.16)",
  },
  updateBadgeMuted: {
    backgroundColor: "rgba(163, 157, 121, 0.22)",
  },
  updateBadgeText: {
    fontFamily: "WorkSans_500Medium",
    fontSize: 11,
  },
  updateBadgeTextAccent: {
    color: brand.argila,
  },
  updateBadgeTextMuted: {
    color: brand.olivaDeep,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: "WorkSans_500Medium",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: brand.olivaDeep,
  },
});
