import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { NumberField } from "@/common/components/ui/NumberField";
import { Text } from "@/common/components/ui/Text";
import { DEFAULT_DRC_PERCENT, SCRAP_DRY_RATIO } from "@/common/config/appConfig";
import { showToast } from "@/common/hooks/useToast";
import { useT, type TranslationKey } from "@/common/i18n";
import { borderWidth, colors, radius, spacing } from "@/common/theme/tokens";
import { formatKg, parseNumber } from "@/common/utils/format";
import type { Worker } from "@/modules/attendance/types/worker";

import { useCollectionStore } from "../store/collectionStore";
import type { CollectionEntry } from "../types/collection";
import { computeDryRubber } from "../utils/dryRubber";

type CollectionSheetProps = {
	blockId: string;
	worker: Worker | null;
	existing: CollectionEntry | null;
	onClose: () => void;
};

type Field = "latex" | "drc" | "scrap";

function validate(field: Field, value: number | null): TranslationKey | null {
	if (value === null) return "collection.required";
	if (value < 0) return "collection.notNegative";
	if (field === "drc" && (value < 1 || value > 100)) return "collection.drcRange";
	return null;
}

export function CollectionSheet({ blockId, worker, existing, onClose }: CollectionSheetProps) {
	const t = useT();
	const upsert = useCollectionStore((s) => s.upsert);
	const [latex, setLatex] = useState(existing ? String(existing.latexKg) : "");
	const [drc, setDrc] = useState(String(existing?.drcPercent ?? DEFAULT_DRC_PERCENT));
	const [scrap, setScrap] = useState(existing ? String(existing.scrapKg) : "");
	const [submitted, setSubmitted] = useState(false);

	const values = { latex: parseNumber(latex), drc: parseNumber(drc), scrap: parseNumber(scrap) };
	const errors = {
		latex: validate("latex", values.latex),
		drc: validate("drc", values.drc),
		scrap: validate("scrap", values.scrap),
	};
	const dry = computeDryRubber(Math.max(values.latex ?? 0, 0), Math.max(values.drc ?? 0, 0), Math.max(values.scrap ?? 0, 0));
	const errorText = (field: Field) => (submitted && errors[field] ? t(errors[field]) : null);

	const save = () => {
		setSubmitted(true);
		if (!worker || errors.latex || errors.drc || errors.scrap) return;
		const result = upsert({ blockId, workerId: worker.id, latexKg: values.latex ?? 0, drcPercent: values.drc ?? 0, scrapKg: values.scrap ?? 0 });
		showToast(t(result === "created" ? "collection.saved" : "collection.updated", { name: worker.name }), "success");
		onClose();
	};

	return (
		<BottomSheet
			visible={!!worker}
			onClose={onClose}
			title={worker?.name ?? ""}
			subtitle={worker?.id}
			footer={<Button label={existing ? t("common.update") : t("common.save")} onPress={save} size="lg" fullWidth />}
		>
			<View style={styles.row}>
				<NumberField label={t("collection.latexWet")} unit={t("common.kg")} value={latex} onChangeText={setLatex} placeholder="0.0" error={errorText("latex")} autoFocus={!existing} />
				<NumberField label={t("collection.drc")} unit={t("common.percent")} value={drc} onChangeText={setDrc} placeholder={String(DEFAULT_DRC_PERCENT)} error={errorText("drc")} />
			</View>
			<View style={styles.row}>
				<NumberField label={t("collection.scrap")} unit={t("common.kg")} value={scrap} onChangeText={setScrap} placeholder="0.0" error={errorText("scrap")} />
			</View>

			<View style={styles.result}>
				<View style={styles.breakdown}>
					<View style={styles.line}>
						<Text variant="label" tone="muted">
							{t("collection.dryLatex")}
						</Text>
						<Text variant="bodyStrong" tabular>
							{`${formatKg(dry.dryLatex)} ${t("common.kg")}`}
						</Text>
					</View>
					<View style={styles.line}>
						<Text variant="label" tone="muted">
							{t("collection.dryScrap", { ratio: Math.round(SCRAP_DRY_RATIO * 100) })}
						</Text>
						<Text variant="bodyStrong" tabular>
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
