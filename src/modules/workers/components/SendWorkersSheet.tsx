import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { Chip } from "@/common/components/ui/Chip";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { userMessage } from "@/common/services/httpClient";
import { syncNow } from "@/common/sync/syncEngine";
import { borderWidth, colors, opacity, radius, sizes, spacing } from "@/common/theme/tokens";
import { useAuthStore } from "@/modules/auth/store/authStore";
import type { Worker, WorkerRequest } from "@/modules/centre/types/centreDay";

import { bringBack, getCandidates, sendWorkers } from "../services/workerMoveService";
import type { MoveCandidate, SendPeriod, WorkerSource } from "../types/workers";
import { periodEnd, periodOptions } from "../utils/workerFormat";
import { SourceChips } from "./SourceChips";

const SEARCH_DELAY = 300;

type SendWorkersSheetProps = {
	visible: boolean;
	ccId: number;
	ccName: string;
	// the centre's own estate, for the From choice of a direct bring
	estateId?: number | null;
	date: string;
	// answering a centre's request; without one this is a direct send
	request?: WorkerRequest | null;
	// workers sent to this centre or away from it, offered for Bring back
	sentHere?: Worker[];
	onClose: () => void;
	onSent?: () => void;
};

export function SendWorkersSheet({ visible, ccId, ccName, estateId = null, date, request, sentHere = [], onClose, onSent }: SendWorkersSheetProps) {
	const t = useT();
	const userId = useAuthStore((s) => s.session?.user.id ?? null);
	const [query, setQuery] = useState("");
	const [candidates, setCandidates] = useState<MoveCandidate[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [period, setPeriod] = useState<SendPeriod>("today");
	const [from, setFrom] = useState<WorkerSource>({ source: "own" });
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!visible || !userId) return;
		let active = true;
		const timer = setTimeout(() => {
			setLoading(true);
			getCandidates(userId, ccId, date, query, request ? undefined : from, request?.id || undefined)
				.then(({ data }) => {
					if (!active) return;
					setCandidates(data);
					setError(null);
				})
				.catch((e: unknown) => {
					if (active) setError(userMessage(e));
				})
				.finally(() => {
					if (active) setLoading(false);
				});
		}, SEARCH_DELAY);
		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, [visible, userId, ccId, date, query, from, request]);

	const close = () => {
		setQuery("");
		setSelected(new Set());
		setPeriod("today");
		setFrom({ source: "own" });
		onClose();
	};

	const toggle = (id: number) =>
		setSelected((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	const send = async () => {
		if (!userId || selected.size === 0 || busy) return;
		setBusy(true);
		try {
			await sendWorkers(userId, { cc_id: ccId, employee_ids: [...selected], from_date: date, to_date: periodEnd(date, period), request_id: request?.id || undefined });
			showToast(t("workers.sent", { count: selected.size, centre: ccName }), "success");
			void syncNow();
			onSent?.();
			close();
		} catch (e) {
			showToast(userMessage(e), "danger");
		} finally {
			setBusy(false);
		}
	};

	const confirmBringBack = (worker: Worker) => {
		const moveId = worker.move_id;
		if (!userId || !moveId) return;
		Alert.alert(t("workers.bringBackTitle", { name: worker.name }), t("workers.bringBackBody", { name: worker.name }), [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("workers.bringBack"),
				onPress: () =>
					void bringBack(userId, moveId)
						.then(() => {
							showToast(t("workers.broughtBack", { name: worker.name }), "success");
							void syncNow();
						})
						.catch((e: unknown) => showToast(userMessage(e), "danger")),
			},
		]);
	};

	const stateText = (c: MoveCandidate) => {
		if (c.away_cc_name) return t("workers.stateAway", { centre: c.away_cc_name });
		if (c.attendance_cc_name) return t(c.attendance_status === "present" ? "workers.statePresent" : "workers.stateWaiting", { centre: c.attendance_cc_name });
		return t("workers.stateNotMarked");
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={close}
			title={request ? t("workers.sendTitle", { centre: ccName }) : t("workers.bringTitle")}
			subtitle={request ? t("workers.requestLine", { tappers: request.tappers_needed, general: request.general_needed }) : ccName}
			footer={
				<Button
					label={t("workers.sendCount", { count: selected.size })}
					icon="user-plus"
					onPress={() => void send()}
					disabled={selected.size === 0}
					loading={busy}
					size="lg"
					fullWidth
				/>
			}
		>
			{sentHere.length > 0 ? (
				<View style={styles.group}>
					<Text variant="label" tone="muted">
						{t("workers.sentHere")}
					</Text>
					{sentHere.map((w) => (
						<View key={w.id} style={styles.sentRow}>
							<View style={styles.body}>
								<Text variant="bodyStrong" numberOfLines={1}>
									{w.name}
								</Text>
								<Text variant="caption" tone="subtle" numberOfLines={1}>
									{w.working_at
										? t("attendance.atCentre", { centre: w.working_at })
										: w.moved_from
											? t("attendance.fromCentre", { centre: w.moved_from })
											: t("attendance.fromAnother")}
								</Text>
							</View>
							<Button label={t("workers.bringBack")} icon="rotate-ccw" variant="secondary" size="sm" onPress={() => confirmBringBack(w)} />
						</View>
					))}
				</View>
			) : null}

			{request ? null : (
				<SourceChips
					value={from}
					onChange={(next) => {
						setFrom(next);
						setSelected(new Set());
					}}
					estateId={estateId}
				/>
			)}

			<Text variant="label" tone="muted">
				{t("workers.period")}
			</Text>
			<View style={styles.chips}>
				{periodOptions.map((o) => (
					<Chip key={o.value} label={t(o.label)} selected={period === o.value} onPress={() => setPeriod(o.value)} />
				))}
			</View>

			<TextField icon="search" value={query} onChangeText={setQuery} placeholder={t("workers.search")} autoCorrect={false} returnKeyType="search" />

			{loading && candidates.length === 0 ? (
				<ActivityIndicator color={colors.brand[700]} style={styles.loading} />
			) : error ? (
				<EmptyState icon="wifi-off" title={t("workers.offline")} body={error} />
			) : candidates.length === 0 ? (
				<EmptyState icon="users" title={t("workers.noCandidates")} />
			) : (
				<View style={styles.list}>
					{candidates.map((c) => {
						const away = !!c.away_cc_name;
						const checked = selected.has(c.id);
						return (
							<Pressable
								key={c.id}
								onPress={() => toggle(c.id)}
								disabled={away}
								accessibilityRole="checkbox"
								accessibilityState={{ checked, disabled: away }}
								style={({ pressed }) => [styles.row, pressed ? styles.pressed : null, away ? styles.disabled : null]}
							>
								<View style={[styles.check, checked ? styles.checked : null]}>{checked ? <Icon name="check" size="sm" color={colors.onBrand} /> : null}</View>
								<View style={styles.body}>
									<Text variant="bodyStrong" numberOfLines={1}>
										{c.name}
									</Text>
									<Text variant="caption" tone="subtle" numberOfLines={1} tabular>
										{`${c.current_code ? `${c.check_roll_no} · ${c.current_code}` : c.check_roll_no} · ${c.home_cc_name ?? t("workers.noHome")}`}
									</Text>
								</View>
								<View style={styles.side}>
									<Text variant="caption" tone="muted" numberOfLines={1}>
										{c.work_type === "tapper" ? t("workers.tappers") : t("workers.general")}
									</Text>
									<Text variant="caption" tone={c.attendance_status === "present" ? "success" : "subtle"} numberOfLines={1}>
										{stateText(c)}
									</Text>
								</View>
							</Pressable>
						);
					})}
				</View>
			)}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	group: { gap: spacing.sm },
	sentRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
	loading: { paddingVertical: spacing.xl },
	list: { borderRadius: radius.md, borderWidth: borderWidth.thin, borderColor: colors.border, overflow: "hidden" },
	row: { minHeight: sizes.touch + spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: borderWidth.hairline, borderBottomColor: colors.border, backgroundColor: colors.surface },
	pressed: { backgroundColor: colors.surfaceMuted },
	disabled: { opacity: opacity.disabled },
	check: { width: sizes.rowMark - spacing.sm, height: sizes.rowMark - spacing.sm, borderRadius: radius.sm, borderWidth: borderWidth.thick, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
	checked: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
	body: { flex: 1, gap: spacing.xxs },
	side: { alignItems: "flex-end", gap: spacing.xxs, maxWidth: "40%" },
});
