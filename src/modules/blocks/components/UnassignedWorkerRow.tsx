import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar } from "@/common/components/ui/Avatar";
import { Badge } from "@/common/components/ui/Badge";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import type { Worker } from "@/modules/attendance/types/worker";

type UnassignedWorkerRowProps = {
	worker: Worker;
	onAssign: (worker: Worker) => void;
	onTransfer: (worker: Worker) => void;
};

function UnassignedWorkerRowBase({ worker, onAssign, onTransfer }: UnassignedWorkerRowProps) {
	const t = useT();
	return (
		<Card style={styles.card}>
			<View style={styles.top}>
				<Avatar initials={worker.initials} />
				<View style={styles.body}>
					<Text variant="bodyStrong" numberOfLines={1}>
						{worker.name}
					</Text>
					<Text variant="caption" tone="muted" tabular>
						{worker.id}
					</Text>
				</View>
				{worker.isLate ? <Badge label={t("attendance.statusLate")} tone="warning" /> : null}
			</View>
			<View style={styles.actions}>
				<Button label={t("blocks.assign")} icon="user-plus" size="sm" onPress={() => onAssign(worker)} style={styles.action} />
				<Button label={t("blocks.transfer")} icon="repeat" size="sm" variant="secondary" onPress={() => onTransfer(worker)} style={styles.action} />
			</View>
		</Card>
	);
}

export const UnassignedWorkerRow = memo(UnassignedWorkerRowBase);

const styles = StyleSheet.create({
	card: { gap: spacing.md },
	top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	body: { flex: 1, gap: spacing.xxs },
	actions: { flexDirection: "row", gap: spacing.sm },
	action: { flex: 1 },
});
