import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { NumberField } from "@/common/components/ui/NumberField";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { userMessage } from "@/common/services/httpClient";
import { spacing } from "@/common/theme/tokens";
import { formatKg, parseNumber } from "@/common/utils/format";
import { useAuthStore } from "@/modules/auth/store/authStore";
import type { Collection, Worker } from "@/modules/centre/types/centreDay";
import { workerCode } from "@/modules/centre/utils/dayIndex";

import { requestCorrection } from "../services/correctionService";
import type { CollectionField } from "../types/collectionForm";
import { computeDry, hasErrors, validateCollection } from "../utils/collectionMath";

type CorrectionSheetProps = {
	worker: Worker | null;
	entry: Collection | undefined;
	onClose: () => void;
};

// Asks the Assistant Manager to change a locked entry; the entry keeps its values until it is approved on the web
export function CorrectionSheet({ worker, entry, onClose }: CorrectionSheetProps) {
	const t = useT();
	const userId = useAuthStore((s) => s.session?.user.id ?? null);
	const [latex, setLatex] = useState(entry ? String(entry.latex_kg) : "");
	const [drc, setDrc] = useState(entry ? String(entry.sample_drc) : "");
	const [scrap, setScrap] = useState(entry ? String(entry.scrap_kg) : "");
	const [scrapDrc, setScrapDrc] = useState(entry ? String(entry.scrap_drc_percent) : "");
	const [reason, setReason] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [busy, setBusy] = useState(false);

	const values = { latex: parseNumber(latex) ?? (latex.trim() === "" ? 0 : null), drc: parseNumber(drc), scrap: parseNumber(scrap) ?? (scrap.trim() === "" ? 0 : null) };
	const scrapDrcValue = parseNumber(scrapDrc) ?? (entry?.scrap_drc_percent ?? 0);
	const scrapDrcBad = scrapDrc.trim() !== "" && (parseNumber(scrapDrc) === null || scrapDrcValue <= 0 || scrapDrcValue > 100);
	const errors = validateCollection(values);
	const errorText = (field: CollectionField) => {
		const key = errors[field];
		return submitted && key ? t(key) : null;
	};
	const latexKg = values.latex ?? 0;
	const drcValue = latexKg > 0 ? (values.drc ?? 0) : 0;
	const scrapKg = values.scrap ?? 0;
	const changed = !!entry && (latexKg !== entry.latex_kg || drcValue !== entry.sample_drc || scrapKg !== entry.scrap_kg || scrapDrcValue !== entry.scrap_drc_percent);
	const dry = entry ? computeDry(Math.max(latexKg, 0), Math.max(drcValue, 0), Math.max(scrapKg, 0), scrapDrcValue) : null;
	const reasonError = submitted && !reason.trim() ? t("correction.reasonRequired") : null;

	const send = async () => {
		setSubmitted(true);
		if (!entry || !userId || busy || hasErrors(errors) || scrapDrcBad || !reason.trim()) return;
		if (!changed) {
			showToast(t("correction.noChange"), "warning");
			return;
		}
		setBusy(true);
		try {
			await requestCorrection(userId, { entity: "collection", record_id: entry.id, latex_kg: latexKg, sample_drc: drcValue, scrap_kg: scrapKg, scrap_drc: scrapDrcValue, reason: reason.trim() });
			showToast(t("correction.sent", { name: worker?.name ?? "" }), "success");
			onClose();
		} catch (e) {
			showToast(userMessage(e), "danger");
		} finally {
			setBusy(false);
		}
	};

	return (
		<BottomSheet
			visible={!!worker && !!entry}
			onClose={onClose}
			title={t("correction.title")}
			subtitle={worker ? `${worker.name} · ${workerCode(worker)}` : undefined}
			footer={<Button label={t("correction.send")} icon="edit-2" onPress={() => void send()} loading={busy} size="lg" fullWidth />}
		>
			{entry ? (
				<Text variant="caption" tone="muted" tabular>
					{t("correction.current", { latex: entry.latex_kg, drc: entry.sample_drc, scrap: entry.scrap_kg, scrapDrc: entry.scrap_drc_percent, dry: formatKg(entry.total_dry) })}
				</Text>
			) : null}
			<View style={styles.row}>
				<NumberField label={t("collection.latexWet")} unit={t("common.kg")} value={latex} onChangeText={setLatex} error={errorText("latex")} returnKeyType="next" />
				<NumberField label={t("collection.drc")} unit={t("common.percent")} value={drc} onChangeText={setDrc} error={errorText("drc")} returnKeyType="next" />
			</View>
			<View style={styles.row}>
				<NumberField label={t("collection.scrap")} unit={t("common.kg")} value={scrap} onChangeText={setScrap} error={errorText("scrap")} returnKeyType="next" />
				<NumberField label={t("collection.scrapDrc")} unit={t("common.percent")} value={scrapDrc} onChangeText={setScrapDrc} error={submitted && scrapDrcBad ? t("collection.drcRange") : null} returnKeyType="next" />
			</View>
			{dry && changed ? (
				<Text variant="label" tone="brand" tabular>
					{t("correction.newDry", { dry: formatKg(dry.totalDry) })}
				</Text>
			) : null}
			<TextField label={t("correction.reason")} value={reason} onChangeText={setReason} placeholder={t("correction.reasonPlaceholder")} error={reasonError} returnKeyType="done" />
			<Text variant="caption" tone="muted" align="center">
				{t("correction.note")}
			</Text>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: spacing.md },
});
