import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import { colors } from "@/common/theme/tokens";

type ScreenProps = {
	header?: React.ReactNode;
	children: React.ReactNode;
};

export function Screen({ header, children }: ScreenProps) {
	return (
		<View style={styles.screen}>
			<StatusBar style="light" />
			{header}
			<View style={styles.body}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.canvas },
	body: { flex: 1 },
});
