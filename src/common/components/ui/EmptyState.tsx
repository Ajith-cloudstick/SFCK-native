import { StyleSheet, View } from "react-native";

import { colors, radius, sizes, spacing } from "@/common/theme/tokens";

import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type EmptyStateProps = {
	icon?: IconName;
	title: string;
	body?: string;
	action?: React.ReactNode;
};

export function EmptyState({ icon = "inbox", title, body, action }: EmptyStateProps) {
	return (
		<View style={styles.wrap}>
			<View style={styles.iconWrap}>
				<Icon name={icon} size="lg" color={colors.brand[600]} />
			</View>
			<Text variant="subheading" align="center">
				{title}
			</Text>
			{body ? (
				<Text variant="body" tone="muted" align="center">
					{body}
				</Text>
			) : null}
			{action}
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { alignItems: "center", paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xxl, gap: spacing.sm },
	iconWrap: {
		width: sizes.header,
		height: sizes.header,
		borderRadius: radius.pill,
		backgroundColor: colors.brand[50],
		alignItems: "center",
		justifyContent: "center",
		marginBottom: spacing.xs,
	},
});
