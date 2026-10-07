import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { Icon, type IconName } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { useSyncStore, useSyncSummary } from "@/common/sync/syncStore";
import type { SyncState } from "@/common/sync/types";
import { colors, opacity, radius, sizes, spacing } from "@/common/theme/tokens";

type SyncPillProps = {
	onPress: () => void;
};

const look: Record<SyncState, { icon: IconName; dot: string }> = {
	synced: { icon: "check-circle", dot: colors.brand[300] },
	pending: { icon: "upload-cloud", dot: colors.warning.bg },
	offline: { icon: "wifi-off", dot: colors.onBrandMuted },
	error: { icon: "alert-triangle", dot: colors.danger.bg },
};

export function SyncPill({ onPress }: SyncPillProps) {
	const t = useT();
	const { pending, state } = useSyncSummary();
	const syncing = useSyncStore((s) => s.syncing);
	const label =
		state === "offline" ? t("sync.offline") : state === "error" ? t("sync.error") : state === "pending" ? t("sync.pending", { count: pending }) : t("sync.synced");
	const p = look[state];

	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={`${t("sync.centre")}: ${label}`}
			hitSlop={{ top: spacing.sm, bottom: spacing.sm }}
			style={({ pressed }) => [styles.pill, pressed ? styles.pressed : null]}
		>
			{syncing && state !== "offline" ? <ActivityIndicator size="small" color={colors.onBrand} /> : <Icon name={p.icon} size="sm" color={p.dot} />}
			<Text variant="label" tone="onBrand" numberOfLines={1} tabular>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	pill: {
		minHeight: sizes.touch - spacing.md,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		paddingHorizontal: spacing.md,
		borderRadius: radius.pill,
		backgroundColor: colors.onBrandTint,
	},
	pressed: { opacity: opacity.pressed },
});
