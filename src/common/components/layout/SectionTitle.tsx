import { StyleSheet, View } from "react-native";

import { Text } from "@/common/components/ui/Text";
import { spacing } from "@/common/theme/tokens";

type SectionTitleProps = {
	title: string;
	trailing?: React.ReactNode;
};

export function SectionTitle({ title, trailing }: SectionTitleProps) {
	return (
		<View style={styles.row}>
			<Text variant="label" tone="muted" style={styles.title}>
				{title.toUpperCase()}
			</Text>
			{trailing}
		</View>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: spacing.lg, paddingBottom: spacing.sm },
	title: { flex: 1 },
});
