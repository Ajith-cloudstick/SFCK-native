import { StyleSheet, View } from "react-native";

import { Badge } from "@/common/components/ui/Badge";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { Text } from "@/common/components/ui/Text";
import { useLanguageStore, useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import { formatDayDate } from "@/common/utils/format";
import type { WorkerRequest } from "@/modules/centre/types/centreDay";

import { requestStatusLabel, requestStatusTone } from "../utils/workerFormat";

type WorkerRequestCardProps = {
	request: WorkerRequest;
	onCancel?: (request: WorkerRequest) => void;
	onSend?: (request: WorkerRequest) => void;
	showCentre?: boolean;
};

// One request for workers: how many, for which day, and where it stands
export function WorkerRequestCard({ request, onCancel, onSend, showCentre }: WorkerRequestCardProps) {
	const t = useT();
	const language = useLanguageStore((s) => s.language);
	const open = request.status === "waiting" || request.status === "part_sent";
	const queued = request.id === 0;
	const source = request.source_head_office ? t("workers.headOffice") : request.source_name;
	const heading = showCentre ? [request.cc_name, request.division_name, source ? request.estate_name : null].filter(Boolean).join(" · ") : t("workers.ask");

	return (
		<Card style={styles.card}>
			<View style={styles.top}>
				<View style={styles.body}>
					<Text variant="bodyStrong" numberOfLines={1}>
						{heading}
					</Text>
					<Text variant="caption" tone="muted" numberOfLines={2}>
						{[formatDayDate(request.date, language), t("workers.requestLine", { tappers: request.tappers_needed, general: request.general_needed }), showCentre ? null : source]
							.filter(Boolean)
							.join(" · ")}
					</Text>
				</View>
				<Badge label={queued ? t("stock.notSynced") : t(requestStatusLabel[request.status])} tone={queued ? "warning" : requestStatusTone[request.status]} />
			</View>
			{request.note || request.decision_note ? (
				<Text variant="caption" tone="subtle" numberOfLines={3}>
					{[request.note, request.decision_note].filter(Boolean).join(" · ")}
				</Text>
			) : null}
			{showCentre && request.requested_by_name ? (
				<Text variant="caption" tone="subtle" numberOfLines={1}>
					{t("workers.askedBy", { name: request.requested_by_name })}
				</Text>
			) : null}
			{open && !queued && (onCancel || onSend) ? (
				<View style={styles.actions}>
					{onSend ? <Button label={t("workers.openRequest")} icon="user-plus" size="sm" onPress={() => onSend(request)} style={styles.flex} /> : null}
					{onCancel ? <Button label={t("workers.cancel")} icon="x" variant="secondary" size="sm" onPress={() => onCancel(request)} style={styles.flex} /> : null}
				</View>
			) : null}
		</Card>
	);
}

const styles = StyleSheet.create({
	card: { gap: spacing.sm },
	top: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
	body: { flex: 1, gap: spacing.xxs },
	actions: { flexDirection: "row", gap: spacing.sm },
	flex: { flex: 1 },
});
