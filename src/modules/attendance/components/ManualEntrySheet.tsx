import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Badge } from "@/common/components/ui/Badge";
import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { toastPalette } from "@/common/components/ui/Toast";
import { useToast, type ToastTone } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { colors, radius, spacing } from "@/common/theme/tokens";
import { useDayIndex } from "@/modules/centre/store/centreDayStore";
import type { Worker } from "@/modules/centre/types/centreDay";
import { workerCode } from "@/modules/centre/utils/dayIndex";
import { dutyTypeOf } from "@/modules/centre/utils/duty";

import { useMarkWorker } from "../hooks/useMarkWorker";
import type { MarkOutcome } from "../types/attendance";
import { findWorkerByCode } from "../utils/matchWorker";
import { stateBadge } from "./WorkerRow";

type ManualEntrySheetProps = {
	visible: boolean;
	onClose: () => void;
	onMarked?: (worker: Worker, outcome: MarkOutcome) => void;
	onCollect?: (worker: Worker) => void;
};

export function ManualEntrySheet({ visible, onClose, onMarked, onCollect }: ManualEntrySheetProps) {
	const t = useT();
	const index = useDayIndex();
	const markWorker = useMarkWorker();
	const [code, setCode] = useState("");
	const [busy, setBusy] = useState(false);
	// what marking just said (late and waiting, already marked...), shown here because the sheet covers the screen behind it
	const [result, setResult] = useState<{ message: string; tone: ToastTone } | null>(null);

	const match = index && code.trim().length >= 2 ? findWorkerByCode(index.day.workers, code) : null;
	const record = match ? index?.attendance.get(match.id) : undefined;
	const state = record?.status ?? "not_marked";
	// like a second scan: a present tapper without a collection goes on to the collection entry
	const tapper = !!match && dutyTypeOf(match) === "tapper";
	const collected = !!match && !!index?.collections.has(match.id);
	const atWork = record?.status === "present" || record?.status === "pending";
	const canCollect = !!onCollect && tapper && atWork && !collected;
	const note = !match || !record || !tapper ? null : collected ? t("scan.collectionDone", { name: match.name }) : !atWork ? t("scan.notPresent", { name: match.name }) : null;

	const close = () => {
		setCode("");
		setResult(null);
		onClose();
	};

	const confirm = async () => {
		if (canCollect && match) {
			setCode("");
			onCollect?.(match);
			return;
		}
		if (!match || record || busy) return;
		setBusy(true);
		setResult(null);
		const outcome = await markWorker(match);
		setBusy(false);
		const { message, tone } = useToast.getState();
		if (message) setResult({ message, tone });
		onMarked?.(match, outcome);
		if (outcome === "marked" || outcome === "waiting") setCode("");
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={close}
			title={t("attendance.enterIdTitle")}
			subtitle={t("attendance.enterIdHint")}
			footer={
				<Button
					label={canCollect ? t("collection.add") : t("attendance.markPresent")}
					onPress={() => void confirm()}
					disabled={!match || (!!record && !canCollect)}
					loading={busy}
					size="lg"
					fullWidth
				/>
			}
		>
			<TextField
				label={t("attendance.workerId")}
				icon="hash"
				value={code}
				onChangeText={(text) => {
						setCode(text);
						setResult(null);
					}}
				placeholder="SFCK-000123"
				autoCapitalize="characters"
				autoCorrect={false}
				autoFocus
				returnKeyType="done"
				onSubmitEditing={() => void confirm()}
				error={code.trim().length >= 3 && !match ? t("attendance.notInCentre") : null}
			/>
			{result ? (
				<View style={[styles.result, { backgroundColor: toastPalette[result.tone].bg }]} accessibilityLiveRegion="polite">
					<Icon name={toastPalette[result.tone].icon} size="sm" color={toastPalette[result.tone].fg} />
					<Text variant="bodyStrong" style={[styles.resultText, { color: toastPalette[result.tone].fg }]}>
						{result.message}
					</Text>
				</View>
			) : null}
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
			{note ? (
				<Text variant="caption" tone="muted">
					{note}
				</Text>
			) : null}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	result: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
	resultText: { flex: 1 },
	match: { backgroundColor: colors.brand[50], borderColor: colors.brand[200] },
	matchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	matchBody: { flex: 1, gap: spacing.xxs },
});
