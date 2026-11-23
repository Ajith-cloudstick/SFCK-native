import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/common/components/layout/AppHeader";
import { Screen } from "@/common/components/layout/Screen";
import { Card } from "@/common/components/ui/Card";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { FadeIn } from "@/common/components/ui/FadeIn";
import { Icon } from "@/common/components/ui/Icon";
import { SegmentedControl } from "@/common/components/ui/SegmentedControl";
import { Text } from "@/common/components/ui/Text";
import { useLanguageStore, useT } from "@/common/i18n";
import { userMessage } from "@/common/services/httpClient";
import { colors, radius, sizes, spacing } from "@/common/theme/tokens";
import { formatDayDate } from "@/common/utils/format";
import { istDate } from "@/common/utils/ist";
import { stagger } from "@/common/utils/stagger";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { currentWageMonth, monthName, shiftMonth } from "@/modules/wages/utils/wageFormat";

import { getCheckRoll, getForm46, getMuster } from "../services/reportService";
import type { CheckRoll, Form46, Muster } from "../types/reports";

type Kind = "production" | "muster" | "checkRoll";

const shiftDay = (iso: string, delta: number) => {
	const date = new Date(`${iso}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + delta);
	return date.toISOString().slice(0, 10);
};

const kg = (value: number, digits = 2) => value.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

// The open centre's daily production (Form 46), muster chit and month's check roll, read from the server
export default function ReportsPage() {
	const t = useT();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const language = useLanguageStore((s) => s.language);
	const session = useAuthStore((s) => s.session);
	const centreId = useAuthStore((s) => s.centreId);
	const userId = session?.user.id ?? null;
	const [kind, setKind] = useState<Kind>("production");
	const [date, setDate] = useState(istDate);
	const [month, setMonth] = useState(currentWageMonth);
	const [production, setProduction] = useState<Form46 | null>(null);
	const [muster, setMuster] = useState<Muster | null>(null);
	const [checkRoll, setCheckRoll] = useState<CheckRoll | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		if (!userId || !centreId) return;
		setLoading(true);
		try {
			if (kind === "production") setProduction((await getForm46(userId, centreId, date)).data);
			else if (kind === "muster") setMuster((await getMuster(userId, centreId, date)).data);
			else setCheckRoll((await getCheckRoll(userId, centreId, month)).data);
			setError(null);
		} catch (e) {
			setError(userMessage(e));
		} finally {
			setLoading(false);
		}
	}, [userId, centreId, kind, date, month]);

	useEffect(() => {
		void load();
	}, [load]);

	const isDaily = kind !== "checkRoll";
	const today = istDate();
	const label = isDaily ? formatDayDate(date, language) : monthName(month, language);
	const canStepForward = isDaily ? date < today : month < currentWageMonth();

	const renderBody = () => {
		if (loading) return <ActivityIndicator color={colors.brand[700]} style={styles.loading} />;
		if (error) return <EmptyState icon="wifi-off" title={t("reports.offline")} body={error} />;
		if (kind === "production") {
			if (!production || production.rows.length === 0) return <EmptyState icon="inbox" title={t("reports.none")} />;
			return (
				<View style={styles.list}>
					{production.rows.map((r, i) => (
						<FadeIn key={`${r.check_roll_no}-${i}`} delay={stagger(i)}>
						<Card style={styles.card}>
							<View style={styles.line}>
								<Text variant="bodyStrong" numberOfLines={1} style={styles.grow}>
									{r.worker}
								</Text>
								<Text variant="bodyStrong" tabular>
									{kg(r.total_dry, 3)} kg
								</Text>
							</View>
							<Text variant="caption" tone="subtle" tabular>
								{[r.roll_no ?? r.check_roll_no, r.block_no, r.clone].filter(Boolean).join(" · ")}
							</Text>
							<Text variant="caption" tone="muted" tabular>
								{`${t("reports.latex")} ${kg(r.latex_kg)} kg · ${t("reports.drc")} ${kg(r.sample_drc, 1)}% · ${t("reports.scrap")} ${kg(r.scrap_kg)} kg`}
							</Text>
						</Card>
						</FadeIn>
					))}
					<Card style={styles.card}>
						<View style={styles.line}>
							<Text variant="bodyStrong" style={styles.grow}>
								{t("reports.total")}
							</Text>
							<Text variant="bodyStrong" tabular>
								{kg(production.total.total_dry, 3)} kg
							</Text>
						</View>
						<Text variant="caption" tone="muted" tabular>
							{`${t("reports.latex")} ${kg(production.total.latex_kg)} kg · ${t("reports.scrap")} ${kg(production.total.scrap_kg)} kg`}
						</Text>
					</Card>
				</View>
			);
		}
		if (kind === "muster") {
			if (!muster || muster.groups.length === 0) return <EmptyState icon="inbox" title={t("reports.none")} />;
			return (
				<View style={styles.list}>
					{muster.groups.map((g, i) => (
						<FadeIn key={`${g.work_nature}-${g.location}-${i}`} delay={stagger(i)}>
						<Card style={styles.card}>
							<Text variant="bodyStrong">{[g.work_nature, g.location].filter(Boolean).join(" · ")}</Text>
							<Text variant="caption" tone="subtle">
								{t("reports.workers", { count: g.workers.length })}
							</Text>
							{g.workers.map((w) => (
								<Text key={w.employee_id} variant="body" numberOfLines={1}>
									{`${w.code ?? w.check_roll_no}  ${w.name}`}
								</Text>
							))}
						</Card>
						</FadeIn>
					))}
					<Text variant="caption" tone="muted" style={styles.footnote}>
						{t("reports.workers", { count: muster.workers })}
					</Text>
				</View>
			);
		}
		if (!checkRoll || checkRoll.rows.length === 0) return <EmptyState icon="inbox" title={t("reports.none")} />;
		return (
			<View style={styles.list}>
				{checkRoll.rows.map((r, i) => (
					<FadeIn key={r.employee_id} delay={stagger(i)}>
					<Card style={styles.card}>
						<View style={styles.line}>
							<Text variant="bodyStrong" numberOfLines={1} style={styles.grow}>
								{r.name}
							</Text>
							<Text variant="caption" tone="subtle" tabular>
								{r.code ?? r.check_roll_no}
							</Text>
						</View>
						<Text variant="caption" tone="muted" tabular>
							{`${t("reports.present")} ${r.present} · ${t("reports.leave")} ${r.leave}`}
						</Text>
					</Card>
					</FadeIn>
				))}
			</View>
		);
	};

	return (
		<Screen header={<AppHeader title={t("reports.title")} onBack={() => (router.canGoBack() ? router.back() : router.replace("/today"))} />}>
			<ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
				<SegmentedControl<Kind>
					options={[
						{ value: "production", label: t("reports.production") },
						{ value: "muster", label: t("reports.muster") },
						{ value: "checkRoll", label: t("reports.checkRoll") },
					]}
					value={kind}
					onChange={setKind}
				/>
				<View style={styles.nav}>
					<Pressable accessibilityRole="button" accessibilityLabel={t("reports.previous")} onPress={() => (isDaily ? setDate(shiftDay(date, -1)) : setMonth(shiftMonth(month, -1)))} style={styles.step}>
						<Icon name="chevron-left" />
					</Pressable>
					<Text variant="bodyStrong" style={styles.navLabel}>
						{label}
					</Text>
					<Pressable accessibilityRole="button" accessibilityLabel={t("reports.next")} disabled={!canStepForward} onPress={() => (isDaily ? setDate(shiftDay(date, 1)) : setMonth(shiftMonth(month, 1)))} style={[styles.step, !canStepForward ? styles.disabled : null]}>
						<Icon name="chevron-right" />
					</Pressable>
				</View>
				{renderBody()}
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	content: { padding: spacing.lg, gap: spacing.md },
	nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
	navLabel: { flex: 1, textAlign: "center" },
	step: { width: sizes.touch, height: sizes.touch, alignItems: "center", justifyContent: "center", borderRadius: radius.md },
	disabled: { opacity: 0.35 },
	loading: { marginTop: spacing.xl },
	list: { gap: spacing.sm },
	card: { padding: spacing.md, gap: spacing.xxs },
	line: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	grow: { flex: 1 },
	footnote: { textAlign: "center", marginTop: spacing.xs },
});
