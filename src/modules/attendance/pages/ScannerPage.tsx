import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/common/components/ui/Button";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { borderWidth, colors, duration, opacity, radius, sizes, spacing } from "@/common/theme/tokens";
import { currentDay, useCentreDayStore, useDayIndex, useIsPastDay } from "@/modules/centre/store/centreDayStore";
import type { Worker } from "@/modules/centre/types/centreDay";
import { buildDayIndex } from "@/modules/centre/utils/dayIndex";
import { dutyTypeOf } from "@/modules/centre/utils/duty";
import { CollectionEntrySheet } from "@/modules/collection/components/CollectionEntrySheet";

import { ManualEntrySheet } from "../components/ManualEntrySheet";
import { useMarkWorker } from "../hooks/useMarkWorker";
import type { MarkOutcome } from "../types/attendance";
import { findWorkerByCode } from "../utils/matchWorker";

const feedback: Record<MarkOutcome, Haptics.NotificationFeedbackType> = {
	marked: Haptics.NotificationFeedbackType.Success,
	waiting: Haptics.NotificationFeedbackType.Success,
	already: Haptics.NotificationFeedbackType.Warning,
	blocked: Haptics.NotificationFeedbackType.Error,
	unavailable: Haptics.NotificationFeedbackType.Error,
};

export default function ScannerPage() {
	const t = useT();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [permission, requestPermission] = useCameraPermissions();
	const pastDay = useIsPastDay();
	const centreName = useCentreDayStore((s) => s.serverDay?.centre.name ?? "");
	const markWorker = useMarkWorker();
	const [torch, setTorch] = useState(false);
	const [marked, setMarked] = useState(0);
	const [last, setLast] = useState<string | null>(null);
	const [manualOpen, setManualOpen] = useState(false);
	const [collectFor, setCollectFor] = useState<Worker | null>(null);
	const index = useDayIndex();
	const sheetOpen = manualOpen || collectFor !== null;
	const recent = useRef(new Map<string, number>());
	const busy = useRef(false);

	const close = () => (router.canGoBack() ? router.back() : router.replace("/attendance"));

	const record = useCallback((worker: Worker, outcome: MarkOutcome) => {
		Haptics.notificationAsync(feedback[outcome]).catch(() => undefined);
		if (outcome === "marked" || outcome === "waiting") setMarked((n) => n + 1);
		setLast(worker.name);
	}, []);

	// First scan of the day marks attendance; scanning a present tapper again opens their collection entry.
	// The camera reports a card many times a second, so a card only counts again once it has been out of
	// view for scanDebounce (every sighting refreshes its time), and nothing is read while a sheet is open.
	const onScanned = useCallback(
		async ({ data }: BarcodeScanningResult) => {
			const code = data.trim();
			const now = Date.now();
			const seenAt = recent.current.get(code);
			recent.current.set(code, now);
			if (!code || busy.current || sheetOpen || (seenAt !== undefined && now - seenAt < duration.scanDebounce)) return;
			busy.current = true;
			try {
				const day = currentDay();
				const worker = day ? findWorkerByCode(day.workers, code) : null;
				if (!day || !worker) {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
					showToast(t("attendance.notInCentreCode", { code }), "danger");
					return;
				}
				const dayIndex = buildDayIndex(day);
				const attendance = dayIndex.attendance.get(worker.id);
				if (!attendance || dutyTypeOf(worker) !== "tapper") {
					record(worker, await markWorker(worker));
					return;
				}
				if (attendance.status !== "present") {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
					showToast(t("scan.waitingApproval", { name: worker.name }), "warning");
					return;
				}
				if (dayIndex.collections.has(worker.id)) {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
					showToast(t("scan.collectionDone", { name: worker.name }));
					return;
				}
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
				setLast(worker.name);
				setCollectFor(worker);
			} finally {
				busy.current = false;
			}
		},
		[markWorker, record, sheetOpen, t],
	);

	const askAgain = () => {
		if (permission && !permission.canAskAgain) Linking.openSettings().catch(() => undefined);
		else void requestPermission();
	};

	const renderCamera = () => {
		if (pastDay) {
			return (
				<View style={styles.centre}>
					<View style={styles.permissionIcon}>
						<Icon name="clock" size="xl" color={colors.onBrand} />
					</View>
					<Text variant="heading" tone="onBrand" align="center">
						{t("day.viewOnlyTag")}
					</Text>
					<Text variant="body" align="center" style={styles.onCameraMuted}>
						{t("day.viewOnly")}
					</Text>
				</View>
			);
		}
		if (!permission) {
			return (
				<View style={styles.centre}>
					<ActivityIndicator size="large" color={colors.onBrand} />
				</View>
			);
		}
		if (!permission.granted) {
			return (
				<View style={styles.centre}>
					<View style={styles.permissionIcon}>
						<Icon name="camera" size="xl" color={colors.onBrand} />
					</View>
					<Text variant="heading" tone="onBrand" align="center">
						{t("scan.allowTitle")}
					</Text>
					<Text variant="body" align="center" style={styles.onCameraMuted}>
						{permission.canAskAgain ? t("scan.allowBody") : t("scan.allowSettings")}
					</Text>
					<Button label={permission.canAskAgain ? t("scan.allow") : t("scan.openSettings")} icon="camera" onPress={askAgain} size="lg" style={styles.allow} />
				</View>
			);
		}
		return (
			<View style={styles.cameraWrap}>
				<CameraView
					style={StyleSheet.absoluteFill}
					facing="back"
					enableTorch={torch}
					barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
					onBarcodeScanned={(result) => void onScanned(result)}
				/>
				<View style={styles.overlay} pointerEvents="none">
					<View style={styles.window}>
						<View style={[styles.corner, styles.topLeft]} />
						<View style={[styles.corner, styles.topRight]} />
						<View style={[styles.corner, styles.bottomLeft]} />
						<View style={[styles.corner, styles.bottomRight]} />
					</View>
					<Text variant="bodyStrong" tone="onBrand" align="center" style={styles.hint}>
						{t("scan.hint")}
					</Text>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.screen}>
			<StatusBar style="light" />
			<View style={[styles.header, { paddingTop: insets.top }]}>
				<Pressable onPress={close} style={styles.headerButton} accessibilityRole="button" accessibilityLabel={t("common.close")}>
					<Icon name="x" size="lg" color={colors.onBrand} />
				</Pressable>
				<View style={styles.titles}>
					<Text variant="heading" tone="onBrand" numberOfLines={1}>
						{t("scan.title")}
					</Text>
					<Text variant="caption" tone="onBrandMuted" numberOfLines={1}>
						{centreName}
					</Text>
				</View>
				<Pressable
					onPress={() => setTorch((v) => !v)}
					disabled={!permission?.granted}
					style={({ pressed }) => [styles.headerButton, torch ? styles.torchOn : null, pressed ? styles.pressed : null]}
					accessibilityRole="switch"
					accessibilityState={{ checked: torch }}
					accessibilityLabel={t("scan.torch")}
				>
					<Icon name={torch ? "zap" : "zap-off"} color={torch ? colors.brand[700] : colors.onBrand} />
				</Pressable>
			</View>

			{renderCamera()}

			<View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
				<View style={styles.countRow}>
					<View style={styles.flex}>
						<Text variant="caption" style={styles.onCameraMuted}>
							{t("scan.markedLabel")}
						</Text>
						<Text variant="display" tone="onBrand">
							{String(marked)}
						</Text>
					</View>
					{last ? (
						<View style={styles.last}>
							<Text variant="caption" style={styles.onCameraMuted}>
								{t("scan.last")}
							</Text>
							<Text variant="bodyStrong" tone="onBrand" numberOfLines={1}>
								{last}
							</Text>
						</View>
					) : null}
				</View>
				<View style={styles.actions}>
					<Button label={t("attendance.enterId")} icon="hash" variant="secondary" onPress={() => setManualOpen(true)} style={styles.flex} />
					<Button label={t("scan.done")} icon="check" onPress={close} style={styles.flex} />
				</View>
			</View>

			<ManualEntrySheet
				visible={manualOpen}
				onClose={() => setManualOpen(false)}
				onMarked={record}
				onCollect={(worker) => {
					setManualOpen(false);
					setLast(worker.name);
					setCollectFor(worker);
				}}
			/>
			<CollectionEntrySheet
				key={collectFor?.id ?? "none"}
				worker={collectFor}
				assignment={collectFor ? index?.blockAssignment.get(collectFor.id) : undefined}
				scrapDrcPercent={index?.day.scrap_drc_percent ?? 0}
				onClose={() => setCollectFor(null)}
			/>
		</View>
	);
}

const corner = { position: "absolute" as const, width: sizes.scanCorner, height: sizes.scanCorner, borderColor: colors.onBrand };

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.camera },
	flex: { flex: 1 },
	header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, backgroundColor: colors.brand[700] },
	headerButton: { width: sizes.touch, height: sizes.touch, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
	torchOn: { backgroundColor: colors.surface },
	pressed: { opacity: opacity.pressed },
	titles: { flex: 1, gap: spacing.xxs },
	centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl, gap: spacing.md },
	permissionIcon: { width: sizes.scanButton, height: sizes.scanButton, borderRadius: radius.pill, backgroundColor: colors.onBrandTint, alignItems: "center", justifyContent: "center" },
	onCameraMuted: { color: colors.onCameraMuted },
	allow: { marginTop: spacing.md },
	cameraWrap: { flex: 1, overflow: "hidden" },
	overlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", gap: spacing.xl },
	window: { width: sizes.scanWindow, height: sizes.scanWindow },
	corner,
	topLeft: { top: 0, left: 0, borderTopWidth: borderWidth.heavy, borderLeftWidth: borderWidth.heavy, borderTopLeftRadius: radius.lg },
	topRight: { top: 0, right: 0, borderTopWidth: borderWidth.heavy, borderRightWidth: borderWidth.heavy, borderTopRightRadius: radius.lg },
	bottomLeft: { bottom: 0, left: 0, borderBottomWidth: borderWidth.heavy, borderLeftWidth: borderWidth.heavy, borderBottomLeftRadius: radius.lg },
	bottomRight: { bottom: 0, right: 0, borderBottomWidth: borderWidth.heavy, borderRightWidth: borderWidth.heavy, borderBottomRightRadius: radius.lg },
	hint: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.cameraScrim, overflow: "hidden" },
	footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md, backgroundColor: colors.camera },
	countRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.lg },
	last: { flex: 1, alignItems: "flex-end", gap: spacing.xxs },
	actions: { flexDirection: "row", gap: spacing.sm },
});
