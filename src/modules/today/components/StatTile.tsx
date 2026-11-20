import { StyleSheet, View } from "react-native";

import { Text, type TextTone } from "@/common/components/ui/Text";
import { spacing } from "@/common/theme/tokens";

type StatTileProps = {
	label: string;
	value: string | number;
	tone?: TextTone;
};

export function StatTile({ label, value, tone = "default" }: StatTileProps) {
	return (
		<View style={styles.tile}>
			<Text variant="number" tone={tone} numberOfLines={1} adjustsFontSizeToFit>
				{String(value)}
			</Text>
			<Text variant="label" tone="muted" numberOfLines={1}>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	tile: { flex: 1, gap: spacing.xxs },
});
