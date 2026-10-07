import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Badge } from "@/common/components/ui/Badge";
import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { useT } from "@/common/i18n";
import { colors, spacing } from "@/common/theme/tokens";
import { useDayIndex } from "@/modules/centre/store/centreDayStore";
import type { Worker } from "@/modules/centre/types/centreDay";
import { workerCode } from "@/modules/centre/utils/dayIndex";

import { useMarkWorker } from "../hooks/useMarkWorker";
import type { MarkOutcome } from "../types/attendance";
import { findWorkerByCode } from "../utils/matchWorker";
import { stateBadge } from "./WorkerRow";

type ManualEntrySheetProps = {
	visible: boolean;
	onClose: () => void;
	onMarked?: (worker: Worker, outcome: MarkOutcome) => void;
};

export function ManualEntrySheet({ visible, onClose, onMarked }: ManualEntrySheetProps) {
	const t = useT();
	const index = useDayIndex();
	const markWorker = useMarkWorker();
	const [code, setCode] = useState("");
	const [busy, setBusy] = useState(false);

	const match = index && code.trim().length >= 2 ? findWorkerByCode(index.day.workers, code) : null;
	const record = match ? index?.attendance.get(match.id) : undefined;
	const state = record?.status ?? "not_marked";

	const close = () => {
		setCode("");
		onClose();
	};

	const confirm = async () => {
		if (!match || record || busy) return;
		setBusy(true);
		const outcome = await markWorker(match);
		setBusy(false);
		onMarked?.(match, outcome);
		if (outcome === "marked" || outcome === "waiting") setCode("");
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={close}
			title={t("attendance.enterIdTitle")}
			subtitle={t("attendance.enterIdHint")}
			footer={<Button label={t("attendance.markPresent")} onPress={() => void confirm()} disabled={!match || !!record} loading={busy} size="lg" fullWidth />}
		>
			<TextField
				label={t("attendance.workerId")}
				icon="hash"
				value={code}
				onChangeText={setCode}
				placeholder="SFCK-000123"
				autoCapitalize="characters"
				autoCorrect={false}
				autoFocus
				returnKeyType="done"
				onSubmitEditing={() => void confirm()}
				error={code.trim().length >= 3 && !match ? t("attendance.notInCentre") : null}
			/>
			{match ? (
				<Card style={styles.match}>
					<View style={styles.matchRow}>
						<View style={styles.matchBody}>
							<Text variant="subheading">{match.name}</Text>
							<Text variant="caption" tone="muted" tabular>
								{workerCode(match)}
							</Text>
						</View>
						<Badge label={t(stateBadge[state].label)} tone={stateBadge[state].tone} />
					</View>
				</Card>
			) : null}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	match: { backgroundColor: colors.brand[50], borderColor: colors.brand[200] },
	matchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	matchBody: { flex: 1, gap: spacing.xxs },
});
