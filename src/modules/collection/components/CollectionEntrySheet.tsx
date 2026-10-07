import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { NumberField } from "@/common/components/ui/NumberField";
import { Text } from "@/common/components/ui/Text";
import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { enqueue } from "@/common/sync/syncEngine";
import { borderWidth, colors, radius, spacing } from "@/common/theme/tokens";
import { formatKg, parseNumber } from "@/common/utils/format";
import { currentDay } from "@/modules/centre/store/centreDayStore";
import type { Assignment, CollectionPayload, Worker } from "@/modules/centre/types/centreDay";
import { workerCode } from "@/modules/centre/utils/dayIndex";

import type { CollectionField } from "../types/collectionForm";
import { computeDry, hasErrors, validateCollection } from "../utils/collectionMath";

type CollectionEntrySheetProps = {
	worker: Worker | null;
	assignment: Assignment | undefined;
	scrapDrcPercent: number;
	onClose: () => void;
};

export function CollectionEntrySheet({ worker, assignment, scrapDrcPercent, onClose }: CollectionEntrySheetProps) {
	const t = useT();
	const [latex, setLatex] = useState("");
	const [drc, setDrc] = useState("");
	const [scrap, setScrap] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [busy, setBusy] = useState(false);

	const values = { latex: parseNumber(latex) ?? (latex.trim() === "" ? 0 : null), drc: parseNumber(drc), scrap: parseNumber(scrap) ?? (scrap.trim() === "" ? 0 : null) };
	const errors = validateCollection(values);
	const dry = computeDry(Math.max(values.latex ?? 0, 0), Math.max(values.drc ?? 0, 0), Math.max(values.scrap ?? 0, 0), scrapDrcPercent);
	const errorText = (field: CollectionField) => {
		const key = errors[field];
		return submitted && key ? t(key) : null;
	};
	const block = assignment?.block_no ? t("blocks.blockNo", { no: assignment.block_no }) : t("collection.noBlock");

	const save = async () => {
		setSubmitted(true);
		const day = currentDay();
		if (!worker || !day || hasErrors(errors) || busy) return;
		const latexKg = values.latex ?? 0;
		const payload: CollectionPayload = {
			cc_id: day.centre.id,
			employee_id: worker.id,
			block_id: assignment?.block_id ?? null,
			date: day.date,
			latex_kg: latexKg,
			sample_drc: latexKg > 0 ? (values.drc ?? 0) : 0,
			scrap_kg: values.scrap ?? 0,
		};
		setBusy(true);
		try {
			await enqueue("collection", payload);
			showToast(t("collection.saved", { name: worker.name }), "success");
			onClose();
		} catch {
			showToast(t("errors.saveFailed"), "danger");
		} finally {
			setBusy(false);
		}
	};

	return (
		<BottomSheet
			visible={!!worker}
			onClose={onClose}
			title={worker?.name ?? ""}
			subtitle={worker ? `${workerCode(worker)} · ${block}` : undefined}
			footer={
				<>
					{submitted && errors.form ? (
						<Text variant="label" tone="danger" align="center">
							{t(errors.form)}
						</Text>
					) : null}
					<Button label={t("common.save")} onPress={() => void save()} loading={busy} size="lg" fullWidth />
				</>
			}
		>
			<View style={styles.row}>
				<NumberField label={t("collection.latexWet")} unit={t("common.kg")} value={latex} onChangeText={setLatex} placeholder="0.0" error={errorText("latex")} autoFocus returnKeyType="next" />
				<NumberField label={t("collection.drc")} unit={t("common.percent")} value={drc} onChangeText={setDrc} placeholder="35" error={errorText("drc")} returnKeyType="next" />
			</View>
			<View style={styles.row}>
				<NumberField label={t("collection.scrap")} unit={t("common.kg")} value={scrap} onChangeText={setScrap} placeholder="0.0" error={errorText("scrap")} returnKeyType="done" />
			</View>

			<View style={styles.result}>
				<View style={styles.breakdown}>
					<View style={styles.line}>
						<Text variant="label" tone="muted">
							{t("collection.dryLatex")}
						</Text>
						<Text variant="subheading" tabular>
							{`${formatKg(dry.dryLatex)} ${t("common.kg")}`}
						</Text>
					</View>
					<View style={styles.line}>
						<Text variant="label" tone="muted">
							{t("collection.dryScrap", { ratio: scrapDrcPercent })}
						</Text>
						<Text variant="subheading" tabular>
							{`${formatKg(dry.dryScrap)} ${t("common.kg")}`}
						</Text>
					</View>
				</View>
				<View style={styles.total}>
					<Text variant="label" tone="brand">
						{t("collection.totalDry")}
					</Text>
					<View style={styles.totalValue}>
						<Text variant="display" tone="brand">
							{formatKg(dry.totalDry)}
						</Text>
						<Text variant="subheading" tone="brand">
							{t("common.kg")}
						</Text>
					</View>
				</View>
			</View>
			<Text variant="caption" tone="muted" align="center">
				{t("collection.lockNote")}
			</Text>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: spacing.md },
	result: {
		borderRadius: radius.lg,
		borderWidth: borderWidth.thin,
		borderColor: colors.brand[200],
		backgroundColor: colors.brand[50],
		overflow: "hidden",
	},
	breakdown: { padding: spacing.lg, gap: spacing.sm },
	line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	total: {
		padding: spacing.lg,
		borderTopWidth: borderWidth.thin,
		borderTopColor: colors.brand[200],
		backgroundColor: colors.brand[100],
		gap: spacing.xs,
	},
	totalValue: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
});
