import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { Avatar } from "@/common/components/ui/Avatar";
import { Badge } from "@/common/components/ui/Badge";
import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { ListRow } from "@/common/components/ui/ListRow";
import { Text } from "@/common/components/ui/Text";
import { APP_VERSION } from "@/common/config/appConfig";
import { useT } from "@/common/i18n";
import { useSyncSummary } from "@/common/sync/syncStore";
import { spacing } from "@/common/theme/tokens";
import { initialsOf } from "@/common/utils/format";
import { SyncCentre } from "@/modules/centre/components/SyncCentre";

import { useSignOut } from "../hooks/useSignOut";
import { hasPermission, useAuthStore } from "../store/authStore";

export type AccountView = "account" | "sync";

type AccountSheetProps = {
	visible: boolean;
	view: AccountView;
	onChangeView: (view: AccountView) => void;
	onClose: () => void;
};

export function AccountSheet({ visible, view, onChangeView, onClose }: AccountSheetProps) {
	const t = useT();
	const router = useRouter();
	const session = useAuthStore((s) => s.session);
	const centreId = useAuthStore((s) => s.centreId);
	const { pending, failed } = useSyncSummary();
	const signOut = useSignOut();
	const centre = session?.scope.ccs.find((c) => c.id === centreId);
	const canSwitch = (session?.scope.ccs.length ?? 0) > 1;
	const canSeeStock = hasPermission(session, "can_view_chemical");
	const canSendWorkers = hasPermission(session, "can_send_worker");
	const canSeeWages = hasPermission(session, "can_view_payroll");

	const changeCentre = () => {
		onClose();
		router.push("/choose-centre");
	};

	const open = (path: "/stock" | "/worker-requests" | "/wages") => {
		onClose();
		router.push(path);
	};

	const handleSignOut = () => {
		onClose();
		void signOut();
	};

	if (view === "sync") {
		return (
			<BottomSheet
				visible={visible}
				onClose={onClose}
				title={t("sync.centre")}
				footer={<Button label={t("common.back")} icon="chevron-left" variant="secondary" onPress={() => onChangeView("account")} fullWidth />}
			>
				<SyncCentre />
			</BottomSheet>
		);
	}

	return (
		<BottomSheet visible={visible} onClose={onClose} title={t("account.title")}>
			<View style={styles.profile}>
				<Avatar initials={initialsOf(session?.user.name ?? "")} active />
				<View style={styles.profileBody}>
					<Text variant="subheading" numberOfLines={1}>
						{session?.user.name ?? ""}
					</Text>
					<Text variant="caption" tone="muted" numberOfLines={1}>
						{`${session?.user.role.name ?? ""} · ${session?.user.username ?? ""}`}
					</Text>
				</View>
			</View>

			<Card padded={false} style={styles.group}>
				<ListRow icon="map-pin" title={centre?.name ?? ""} subtitle={t("account.workingAt")} divider={canSwitch || canSeeStock || canSendWorkers || canSeeWages} />
				{canSwitch ? <ListRow icon="repeat" title={t("account.changeCentre")} onPress={changeCentre} chevron divider={canSeeStock || canSendWorkers || canSeeWages} /> : null}
				{canSeeStock ? <ListRow icon="droplet" title={t("account.stock")} onPress={() => open("/stock")} chevron divider={canSendWorkers || canSeeWages} /> : null}
				{canSendWorkers ? <ListRow icon="users" title={t("account.workerRequests")} onPress={() => open("/worker-requests")} chevron divider={canSeeWages} /> : null}
				{canSeeWages ? <ListRow icon="credit-card" title={t("account.wages")} onPress={() => open("/wages")} chevron divider={false} /> : null}
			</Card>

			<SectionTitle title={t("account.about")} />
			<Card padded={false} style={styles.group}>
				<ListRow
					icon="refresh-cw"
					title={t("sync.centre")}
					subtitle={failed > 0 ? t("sync.failedCount", { count: failed }) : pending > 0 ? t("sync.pending", { count: pending }) : t("sync.synced")}
					trailing={failed + pending > 0 ? <Badge label={String(failed + pending)} tone={failed > 0 ? "danger" : "warning"} /> : null}
					onPress={() => onChangeView("sync")}
					chevron
				/>
				<ListRow
					icon="info"
					title={t("account.version")}
					trailing={
						<Text variant="bodyStrong" tone="muted" tabular>
							{APP_VERSION}
						</Text>
					}
					divider={false}
				/>
			</Card>

			<Button label={t("account.signOut")} icon="log-out" variant="danger" onPress={handleSignOut} size="lg" fullWidth style={styles.signOut} />
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	profile: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	profileBody: { flex: 1, gap: spacing.xxs },
	group: { overflow: "hidden" },
	signOut: { marginTop: spacing.lg },
});
