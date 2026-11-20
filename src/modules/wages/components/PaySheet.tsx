import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Badge } from "@/common/components/ui/Badge";
import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { NumberField } from "@/common/components/ui/NumberField";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { showToast } from "@/common/hooks/useToast";
import { useLanguageStore, useT } from "@/common/i18n";
import { userMessage } from "@/common/services/httpClient";
import { borderWidth, colors, radius, spacing } from "@/common/theme/tokens";
import { parseNumber } from "@/common/utils/format";
import { istDate } from "@/common/utils/ist";
import { useAuthStore } from "@/modules/auth/store/authStore";

import { payWages } from "../services/wageService";
import type { WageLine } from "../types/wages";
import { isSalaried, money, payStateOf, shortDate } from "../utils/wageFormat";

type PaySheetProps = {
	line: WageLine;
	period: string;
	canPay: boolean;
	onClose: () => void;
	onSaved: () => void;
};

const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
	<View style={styles.row}>
		<Text variant={strong ? "bodyStrong" : "body"} tone={strong ? "default" : "muted"} style={styles.rowLabel}>
			{label}
		</Text>
		<Text variant={strong ? "bodyStrong" : "body"} tabular>
			{value}
		</Text>
	</View>
);

// PaySheet shows how a person's wages were worked out and records what was paid; the amount starts at the net pay
export function PaySheet({ line, period, canPay, onClose, onSaved }: PaySheetProps) {
	const t = useT();
	const language = useLanguageStore((s) => s.language);
	const userId = useAuthStore((s) => s.session?.user.id ?? null);
	const [amount, setAmount] = useState(String(line.paid_amount ?? line.net));
	const [note, setNote] = useState(line.payment_note ?? "");
	const [submitted, setSubmitted] = useState(false);
	const [busy, setBusy] = useState(false);
	const value = parseNumber(amount);
	const error = submitted && (value === null || value < 0) ? t("wages.amountRequired") : null;
	const difference = value === null ? 0 : Math.round((line.net - value) * 100) / 100;
	const state = payStateOf(line);

	const save = async (paid: number | null) => {
		setSubmitted(true);
		if (!userId || busy || (paid !== null && paid < 0)) return;
		setBusy(true);
		try {
			await payWages(userId, { employee_id: line.employee_id, period, paid_amount: paid, paid_on: istDate(), note: note.trim() || null });
			showToast(paid === null ? t("wages.clearedToast", { name: line.employee_name ?? "" }) : t("wages.paidToast", { name: line.employee_name ?? "" }), "success");
			onSaved();
			onClose();
		} catch (e) {
			showToast(userMessage(e), "danger");
		} finally {
			setBusy(false);
		}
	};

	return (
		<BottomSheet
			visible
			onClose={onClose}
			title={line.employee_name ?? ""}
			subtitle={[line.check_roll_no, line.employee_code].filter(Boolean).join(" · ")}
			footer={
				canPay ? (
					<View style={styles.footer}>
						{line.paid_amount !== null ? <Button label={t("wages.notPaid")} icon="rotate-ccw" variant="secondary" onPress={() => void save(null)} disabled={busy} style={styles.flex} /> : null}
						<Button label={t("wages.markPaid")} icon="check" onPress={() => void save(value ?? -1)} loading={busy} style={styles.flex} />
					</View>
				) : undefined
			}
		>
			<View style={styles.box}>
				{isSalaried(line) ? (
					<Row label={t("wages.salary")} value={line.wages ? money(line.wages) : t("wages.salaryNotSet")} />
				) : (
					<>
						<Row label={t("wages.daysAt", { days: line.days, rate: money(line.daily_rate) })} value={money(line.wages)} />
						{line.total_dry ? <Row label={t("wages.incentiveFor", { kg: line.total_dry.toFixed(2) })} value={money(line.incentive)} /> : null}
						{line.leave_pay ? <Row label={t("wages.leavePay")} value={money(line.leave_pay)} /> : null}
						{line.holiday_pay ? <Row label={t("wages.holidayPay")} value={money(line.holiday_pay)} /> : null}
						{line.washing_allowance ? <Row label={t("wages.washing")} value={money(line.washing_allowance)} /> : null}
						{line.interim_relief ? <Row label={t("wages.interim")} value={money(line.interim_relief)} /> : null}
					</>
				)}
				{line.lcc ? <Row label={t("wages.lcc")} value={money(line.lcc)} /> : null}
				<Row label={t("wages.pf")} value={`− ${money(line.pf)}`} />
				{line.recoveries ? <Row label={line.recovery_note ? t("wages.recoveriesFor", { note: line.recovery_note }) : t("wages.recoveries")} value={`− ${money(line.recoveries)}`} /> : null}
				<View style={styles.divider} />
				<Row label={t("wages.net")} value={money(line.net)} strong />
				{line.voucher_amount ? <Row label={t("wages.voucher")} value={money(line.voucher_amount)} /> : null}
			</View>

			{line.paid_amount !== null ? (
				<View style={styles.paidLine}>
					<Text variant="caption" tone="muted" tabular>
						{t("wages.paidOn", { amount: money(line.paid_amount), date: line.paid_on ? shortDate(line.paid_on, language) : "" })}
					</Text>
					{state === "pending" ? <Badge label={t("wages.pendingAmount", { amount: money(line.balance) })} tone="warning" /> : null}
					{state === "extra" ? <Badge label={t("wages.extraAmount", { amount: money(-line.balance) })} tone="danger" /> : null}
					{state === "paid" ? <Badge label={t("wages.paid")} tone="success" /> : null}
				</View>
			) : null}

			{canPay ? (
				<>
					<View style={styles.flexRow}>
						<NumberField label={t("wages.amountPaid")} unit="₹" value={amount} onChangeText={setAmount} error={error} returnKeyType="done" />
					</View>
					{value !== null && value >= 0 && difference !== 0 ? (
						<Text variant="caption" tone={difference > 0 ? "warning" : "danger"} tabular>
							{difference > 0 ? t("wages.willBePending", { amount: money(difference) }) : t("wages.willBeExtra", { amount: money(-difference) })}
						</Text>
					) : null}
					<TextField label={t("wages.note")} value={note} onChangeText={setNote} placeholder={t("wages.notePlaceholder")} returnKeyType="done" />
				</>
			) : null}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	box: { borderRadius: radius.md, borderWidth: borderWidth.thin, borderColor: colors.border, padding: spacing.md, gap: spacing.xs },
	row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
	rowLabel: { flex: 1 },
	divider: { height: borderWidth.hairline, backgroundColor: colors.border, marginVertical: spacing.xs },
	paidLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
	footer: { flexDirection: "row", gap: spacing.sm },
	flex: { flex: 1 },
	flexRow: { flexDirection: "row" },
});
