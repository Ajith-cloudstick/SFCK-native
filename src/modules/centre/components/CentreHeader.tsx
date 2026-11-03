import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppHeader } from "@/common/components/layout/AppHeader";
import { SyncPill } from "@/common/components/layout/SyncPill";
import { Avatar } from "@/common/components/ui/Avatar";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useLanguageStore, useT } from "@/common/i18n";
import { borderWidth, colors, opacity, sizes, spacing } from "@/common/theme/tokens";
import { formatDayDate, initialsOf } from "@/common/utils/format";
import { istDate } from "@/common/utils/ist";
import { AccountSheet, type AccountView } from "@/modules/auth/components/AccountSheet";
import { useAuthStore } from "@/modules/auth/store/authStore";

import { useCentreDayStore, useIsPastDay } from "../store/centreDayStore";
import { DaySheet } from "./DaySheet";

export function CentreHeader() {
	const t = useT();
	const language = useLanguageStore((s) => s.language);
	const session = useAuthStore((s) => s.session);
	const centreId = useAuthStore((s) => s.centreId);
	const day = useCentreDayStore((s) => s.serverDay);
	const selectedDate = useCentreDayStore((s) => s.selectedDate);
	const pastDay = useIsPastDay();
	const [view, setView] = useState<AccountView | null>(null);
	const [picking, setPicking] = useState(false);
	const scopeCentre = session?.scope.ccs.find((c) => c.id === centreId);
	const title = day?.centre.name ?? scopeCentre?.name ?? t("appName");
	const place = day?.division?.name ?? day?.estate?.name;
	const shownDate = selectedDate ?? istDate();
	const date = formatDayDate(shownDate, language);

	const selectDate = (next: string | null) => {
		const userId = session?.user.id;
		if (userId) void useCentreDayStore.getState().selectDate(next, userId);
	};

	return (
		<>
			<AppHeader
				title={title}
				subtitle={place ? `${date} · ${place}` : date}
				right={
					<>
						<Pressable
							onPress={() => setPicking(true)}
							accessibilityRole="button"
							accessibilityLabel={t("day.choose")}
							style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
						>
							<Icon name="calendar" color={colors.onBrand} />
						</Pressable>
						<SyncPill onPress={() => setView("sync")} />
						<Pressable
							onPress={() => setView("account")}
							accessibilityRole="button"
							accessibilityLabel={t("account.title")}
							style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
						>
							<Avatar initials={initialsOf(session?.user.name ?? "")} small />
						</Pressable>
					</>
				}
			/>
			{pastDay ? (
				<View style={styles.banner}>
					<Icon name="clock" size="sm" color={colors.info.fg} />
					<Text variant="label" tone="info" numberOfLines={1} style={styles.bannerText}>
						{`${t("day.viewing", { date })} · ${t("day.viewOnlyTag")}`}
					</Text>
					<Pressable onPress={() => selectDate(null)} accessibilityRole="button" hitSlop={spacing.sm} style={({ pressed }) => (pressed ? styles.pressed : null)}>
						<Text variant="bodyStrong" tone="brand">
							{t("day.backToToday")}
						</Text>
					</Pressable>
				</View>
			) : null}
			<DaySheet visible={picking} selected={shownDate} onSelect={selectDate} onClose={() => setPicking(false)} />
			<AccountSheet visible={view !== null} view={view ?? "account"} onChangeView={setView} onClose={() => setView(null)} />
		</>
	);
}

const styles = StyleSheet.create({
	iconButton: { width: sizes.touch, height: sizes.touch, alignItems: "center", justifyContent: "center" },
	pressed: { opacity: opacity.pressed },
	banner: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		backgroundColor: colors.info.bg,
		borderBottomWidth: borderWidth.thin,
		borderBottomColor: colors.border,
	},
	bannerText: { flex: 1 },
});
