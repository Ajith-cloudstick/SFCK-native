import { useRouter } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/common/components/layout/AppHeader";
import { Screen } from "@/common/components/layout/Screen";
import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { Badge } from "@/common/components/ui/Badge";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { ListRow } from "@/common/components/ui/ListRow";
import { Text } from "@/common/components/ui/Text";
import { useLanguageStore, useT } from "@/common/i18n";
import { colors, spacing } from "@/common/theme/tokens";
import { formatDayDate } from "@/common/utils/format";
import { istClock } from "@/common/utils/ist";
import { hasPermission, useAuthStore } from "@/modules/auth/store/authStore";
import { DayGate } from "@/modules/centre/components/DayGate";
import { useSyncRefresh } from "@/modules/centre/hooks/useCentreSync";
import { useIsPastDay } from "@/modules/centre/store/centreDayStore";
import type { CentreStock, Requisition } from "@/modules/centre/types/centreDay";
import type { DayIndex } from "@/modules/centre/utils/dayIndex";

import { ReceiveSheet } from "../components/ReceiveSheet";
import { RequestSheet } from "../components/RequestSheet";
import { UsageSheet } from "../components/UsageSheet";
import { formatQty, requisitionStatusLabel, requisitionStatusTone } from "../utils/stockFormat";

const AMMONIA = "ammonia";

// The centre's chemicals and materials: balances, today's usage, the ammonia check and material requests
export default function StockPage() {
	const t = useT();
	const router = useRouter();

	return (
		<Screen header={<AppHeader title={t("stock.title")} onBack={() => (router.canGoBack() ? router.back() : router.replace("/today"))} />}>
			<DayGate>{(index) => <StockContent index={index} />}</DayGate>
		</Screen>
	);
}

function StockContent({ index }: { index: DayIndex }) {
	const t = useT();
	const insets = useSafeAreaInsets();
	const language = useLanguageStore((s) => s.language);
	const session = useAuthStore((s) => s.session);
	const refresh = useSyncRefresh();
	const pastDay = useIsPastDay();
	const [sheet, setSheet] = useState<"usage" | "request" | null>(null);
	const [receiving, setReceiving] = useState<Requisition | null>(null);
	const stock = index.day.stock;
	const canUse = hasPermission(session, "can_change_chemical") && !pastDay;
	const canRequest = hasPermission(session, "can_change_requisition") && !pastDay;

	if (!stock || stock.items.length === 0) {
		return (
			<View style={styles.centre}>
				<EmptyState icon="droplet" title={t("stock.noItems")} />
			</View>
		);
	}

	return (
		<>
			<ScrollView
				contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl {...refresh} colors={[colors.brand[700]]} tintColor={colors.brand[700]} />}
			>
				<Text variant="caption" tone="muted">
					{`${index.day.centre.name} · ${formatDayDate(index.day.date, language)}`}
				</Text>

				<AmmoniaCard stock={stock} latexKg={index.day.collections.reduce((sum, c) => sum + c.latex_kg, 0)} />

				{canUse || canRequest ? (
					<View style={styles.actions}>
						{canUse ? <Button label={t("stock.recordUsage")} icon="droplet" onPress={() => setSheet("usage")} style={styles.flex} /> : null}
						{canRequest ? <Button label={t("stock.requestMaterials")} icon="plus" variant="secondary" onPress={() => setSheet("request")} style={styles.flex} /> : null}
					</View>
				) : null}

				<SectionTitle title={t("stock.balanceTitle")} />
				<Card padded={false}>
					{stock.items.map((item, i) => (
						<ListRow
							key={item.chemical_id}
							title={item.name}
							subtitle={item.used_today > 0 ? t("stock.usedTodayShort", { qty: `${formatQty(item.used_today)} ${item.unit}` }) : undefined}
							trailing={
								<Text variant="bodyStrong" tone={item.balance > 0 ? "default" : "subtle"} tabular>
									{`${formatQty(item.balance)} ${item.unit}`}
								</Text>
							}
							divider={i < stock.items.length - 1}
						/>
					))}
				</Card>

				<SectionTitle title={t("stock.todayUsage")} />
				{stock.usage.length === 0 ? (
					<Text variant="body" tone="muted">
						{t("stock.noUsage")}
					</Text>
				) : (
					<Card padded={false}>
						{stock.usage.map((u, i) => (
							<ListRow
								key={u.client_uuid ?? u.id}
								title={`${u.chemical_name ?? ""} · ${formatQty(u.quantity)} ${u.unit ?? ""}`}
								subtitle={[istClock(u.created_at), u.created_by_name, u.note].filter(Boolean).join(" · ")}
								trailing={u.id === 0 ? <Badge label={t("stock.notSynced")} tone="warning" /> : null}
								divider={i < stock.usage.length - 1}
							/>
						))}
					</Card>
				)}

				<SectionTitle title={t("stock.requestsTitle")} />
				{stock.requisitions.length === 0 ? (
					<Text variant="body" tone="muted">
						{t("stock.noRequests")}
					</Text>
				) : (
					<Card padded={false}>
						{stock.requisitions.map((r, i) => (
							<ListRow
								key={r.client_uuid ?? r.id}
								title={r.lines.map((l) => `${l.item_name} ${formatQty(l.qty_approved ?? l.qty_requested)} ${l.unit}`).join(", ")}
								subtitle={[formatDayDate(r.date, language), r.decision_note].filter(Boolean).join(" · ")}
								trailing={<Badge label={r.id === 0 ? t("stock.notSynced") : t(requisitionStatusLabel[r.status])} tone={r.id === 0 ? "warning" : requisitionStatusTone[r.status]} />}
								onPress={r.status === "issued" && r.id !== 0 && canRequest ? () => setReceiving(r) : undefined}
								chevron={r.status === "issued" && r.id !== 0 && canRequest}
								divider={i < stock.requisitions.length - 1}
							/>
						))}
					</Card>
				)}
			</ScrollView>

			<UsageSheet visible={sheet === "usage"} items={stock.items} onClose={() => setSheet(null)} />
			<RequestSheet visible={sheet === "request"} items={stock.items} onClose={() => setSheet(null)} />
			<ReceiveSheet key={receiving?.id ?? "none"} requisition={receiving} onClose={() => setReceiving(null)} />
		</>
	);
}

// Ammonia used today against the latex collected today, as the client checks it
function AmmoniaCard({ stock, latexKg }: { stock: CentreStock; latexKg: number }) {
	const t = useT();
	const ammonia = stock.items.find((i) => i.name.trim().toLowerCase() === AMMONIA);
	if (!ammonia) return null;
	return (
		<Card style={styles.ammonia}>
			<Text variant="label" tone="muted">
				{t("stock.ammoniaTitle")}
			</Text>
			{latexKg > 0 ? (
				<>
					<Text variant="heading" tone="brand" tabular>
						{t("stock.ammoniaRatio", { ratio: formatQty((ammonia.used_today * 100) / latexKg) })}
					</Text>
					<Text variant="caption" tone="muted" tabular>
						{t("stock.ammoniaLine", { ammonia: formatQty(ammonia.used_today), latex: formatQty(latexKg) })}
					</Text>
				</>
			) : (
				<Text variant="body" tone="muted">
					{t("stock.ammoniaNoLatex")}
				</Text>
			)}
		</Card>
	);
}

const styles = StyleSheet.create({
	centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
	content: { padding: spacing.lg, gap: spacing.md },
	actions: { flexDirection: "row", gap: spacing.sm },
	flex: { flex: 1 },
	ammonia: { gap: spacing.xs },
});
