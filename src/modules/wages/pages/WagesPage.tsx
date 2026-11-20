import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/common/components/layout/AppHeader";
import { Screen } from "@/common/components/layout/Screen";
import { Badge } from "@/common/components/ui/Badge";
import { Card } from "@/common/components/ui/Card";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { Icon } from "@/common/components/ui/Icon";
import { SegmentedControl } from "@/common/components/ui/SegmentedControl";
import { Text } from "@/common/components/ui/Text";
import { useLanguageStore, useT } from "@/common/i18n";
import { userMessage } from "@/common/services/httpClient";
import { borderWidth, colors, opacity, radius, sizes, spacing } from "@/common/theme/tokens";
import { hasPermission, useAuthStore } from "@/modules/auth/store/authStore";

import { PaySheet } from "../components/PaySheet";
import { getCentreWages } from "../services/wageService";
import type { PayState, WageLine, WageSheet } from "../types/wages";
import { currentWageMonth, isSalaried, money, monthName, payStateOf, shiftMonth, shortDate } from "../utils/wageFormat";

type Filter = "all" | "unpaid" | "pending" | "paid";

const STATE_TONE: Record<PayState, "neutral" | "warning" | "danger" | "success"> = { unpaid: "neutral", pending: "warning", extra: "danger", paid: "success" };

// The month's wages of the people posted to this centre, worked out by the server, each marked paid here
export default function WagesPage() {
	const t = useT();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const language = useLanguageStore((s) => s.language);
	const session = useAuthStore((s) => s.session);
	const centreId = useAuthStore((s) => s.centreId);
	const userId = session?.user.id ?? null;
	const centre = session?.scope.ccs.find((c) => c.id === centreId);
	const canPay = hasPermission(session, "can_change_payroll");
	const [month, setMonth] = useState(currentWageMonth);
	const [sheet, setSheet] = useState<WageSheet | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<Filter>("all");
	const [open, setOpen] = useState<WageLine | null>(null);

	const load = useCallback(async () => {
		if (!userId || !centreId) return;
		try {
			const { data } = await getCentreWages(userId, centreId, month);
			setSheet(data);
			setError(null);
		} catch (e) {
			setError(userMessage(e));
		} finally {
			setLoading(false);
		}
	}, [userId, centreId, month]);

	useEffect(() => {
		setLoading(true);
		void load();
	}, [load]);

	const refresh = () => {
		setRefreshing(true);
		void load().finally(() => setRefreshing(false));
	};

	const lines = sheet?.lines ?? [];
	const shown = filter === "all" ? lines : lines.filter((l) => (filter === "pending" ? ["pending", "extra"].includes(payStateOf(l)) : payStateOf(l) === filter));
	const totals = sheet?.totals;
	const isCurrent = month >= currentWageMonth();

	const stateLabel = (line: WageLine) => {
		const state = payStateOf(line);
		if (state === "unpaid") return t("wages.notPaid");
		if (state === "pending") return t("wages.pendingAmount", { amount: money(line.balance) });
		if (state === "extra") return t("wages.extraAmount", { amount: money(-line.balance) });
		return t("wages.paid");
	};

	const renderList = () => {
		if (loading) return <ActivityIndicator color={colors.brand[700]} style={styles.loading} />;
		if (error) return <EmptyState icon="wifi-off" title={t("wages.offline")} body={error} />;
		if (shown.length === 0) return <EmptyState icon="inbox" title={t("wages.none")} />;
		return (
			<View style={styles.list}>
				{shown.map((line) => (
					<Pressable key={line.employee_id} onPress={() => setOpen(line)} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}>
						<View style={styles.body}>
							<Text variant="bodyStrong" numberOfLines={1}>
								{line.employee_name}
							</Text>
							<Text variant="caption" tone="subtle" numberOfLines={1} tabular>
								{isSalaried(line)
									? `${line.employee_code ?? line.check_roll_no ?? ""} · ${line.wages ? t("wages.salary") : t("wages.salaryNotSet")}`
									: `${line.employee_code ?? line.check_roll_no ?? ""} · ${t("wages.daysShort", { days: line.days })}${line.total_dry ? ` · ${line.total_dry.toFixed(1)} kg` : ""}`}
							</Text>
						</View>
						<View style={styles.side}>
							<Text variant="bodyStrong" tabular>
								{money(line.net)}
							</Text>
							<Badge label={stateLabel(line)} tone={STATE_TONE[payStateOf(line)]} />
						</View>
					</Pressable>
				))}
			</View>
		);
	};

	return (
		<Screen header={<AppHeader title={t("wages.title")} onBack={() => (router.canGoBack() ? router.back() : router.replace("/today"))} />}>
			<ScrollView
				contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.brand[700]]} tintColor={colors.brand[700]} />}
			>
				<View style={styles.monthBar}>
					<Pressable onPress={() => setMonth((m) => shiftMonth(m, -1))} accessibilityLabel={t("wages.previousMonth")} style={styles.monthButton}>
						<Icon name="chevron-left" />
					</Pressable>
					<View style={styles.monthText}>
						<Text variant="bodyStrong" align="center">
							{monthName(month, language)}
						</Text>
						<Text variant="caption" tone="muted" align="center" tabular>
							{sheet ? `${centre?.name ?? ""} · ${shortDate(sheet.period.start, language)} – ${shortDate(sheet.period.end, language)}` : centre?.name ?? ""}
						</Text>
					</View>
					<Pressable onPress={() => setMonth((m) => shiftMonth(m, 1))} disabled={isCurrent} accessibilityLabel={t("wages.nextMonth")} style={[styles.monthButton, isCurrent ? styles.dim : null]}>
						<Icon name="chevron-right" />
					</Pressable>
				</View>

				{totals ? (
					<Card>
						<View style={styles.totals}>
							<View style={styles.figure}>
								<Text variant="caption" tone="muted">{t("wages.net")}</Text>
								<Text variant="bodyStrong" tabular>{money(totals.net)}</Text>
							</View>
							<View style={styles.figure}>
								<Text variant="caption" tone="muted">{t("wages.paid")}</Text>
								<Text variant="bodyStrong" tone="success" tabular>{money(totals.paid)}</Text>
							</View>
							<View style={styles.figure}>
								<Text variant="caption" tone="muted">{t("wages.pending")}</Text>
								<Text variant="bodyStrong" tone={totals.pending > 0 ? "warning" : "default"} tabular>{money(totals.pending)}</Text>
							</View>
						</View>
						<Text variant="caption" tone="subtle" tabular>
							{t("wages.peopleLine", { people: totals.people, unpaid: totals.unpaid })}
							{totals.extra > 0 ? ` · ${t("wages.extraAmount", { amount: money(totals.extra) })}` : ""}
						</Text>
					</Card>
				) : null}

				<SegmentedControl<Filter>
					options={[
						{ value: "all", label: t("wages.filterAll") },
						{ value: "unpaid", label: t("wages.notPaid") },
						{ value: "pending", label: t("wages.pending") },
						{ value: "paid", label: t("wages.paid") },
					]}
					value={filter}
					onChange={setFilter}
				/>

				{renderList()}
			</ScrollView>
			{open ? <PaySheet key={open.employee_id} line={open} period={month} canPay={canPay} onClose={() => setOpen(null)} onSaved={() => void load()} /> : null}
		</Screen>
	);
}

const styles = StyleSheet.create({
	content: { padding: spacing.lg, gap: spacing.md },
	loading: { paddingVertical: spacing.xxl },
	monthBar: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
	monthButton: { width: sizes.touch, height: sizes.touch, borderRadius: radius.md, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: borderWidth.thin, borderColor: colors.border },
	monthText: { flex: 1, gap: spacing.xxs },
	dim: { opacity: opacity.disabled },
	totals: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.sm },
	figure: { flex: 1, gap: spacing.xxs },
	list: { borderRadius: radius.md, borderWidth: borderWidth.thin, borderColor: colors.border, overflow: "hidden" },
	row: { minHeight: sizes.touch + spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: borderWidth.hairline, borderBottomColor: colors.border, backgroundColor: colors.surface },
	pressed: { backgroundColor: colors.surfaceMuted },
	body: { flex: 1, gap: spacing.xxs },
	side: { alignItems: "flex-end", gap: spacing.xxs },
});
