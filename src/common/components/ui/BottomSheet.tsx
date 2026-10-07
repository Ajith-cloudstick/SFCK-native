import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useT } from "@/common/i18n";
import { shadow } from "@/common/theme/shadows";
import { colors, radius, sizes, spacing } from "@/common/theme/tokens";

import { Icon } from "./Icon";
import { Text } from "./Text";

type BottomSheetProps = {
	visible: boolean;
	onClose: () => void;
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
};

export function BottomSheet({ visible, onClose, title, subtitle, children, footer }: BottomSheetProps) {
	const t = useT();
	const insets = useSafeAreaInsets();
	const { height } = useWindowDimensions();

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
			<KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel={t("common.close")} />
				<View style={[styles.sheet, { maxHeight: height * sizes.sheetMaxHeight, paddingBottom: insets.bottom + spacing.lg }]}>
					<View style={styles.handle} />
					<View style={styles.header}>
						<View style={styles.titles}>
							<Text variant="heading" numberOfLines={2}>
								{title}
							</Text>
							{subtitle ? (
								<Text variant="label" tone="muted">
									{subtitle}
								</Text>
							) : null}
						</View>
						<Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel={t("common.close")}>
							<Icon name="x" color={colors.textMuted} />
						</Pressable>
					</View>
					<ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
						{children}
					</ScrollView>
					{footer ? <View style={styles.footer}>{footer}</View> : null}
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, justifyContent: "flex-end" },
	backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
	sheet: {
		backgroundColor: colors.surface,
		borderTopLeftRadius: radius.lg,
		borderTopRightRadius: radius.lg,
		paddingTop: spacing.sm,
		...shadow("lg"),
	},
	handle: {
		alignSelf: "center",
		width: sizes.sheetHandle,
		height: sizes.sheetHandleHeight,
		borderRadius: radius.pill,
		backgroundColor: colors.borderStrong,
		marginBottom: spacing.sm,
	},
	header: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingLeft: spacing.xl,
		paddingRight: spacing.sm,
		gap: spacing.sm,
	},
	titles: { flex: 1, gap: spacing.xs, paddingTop: spacing.sm },
	close: { width: sizes.touch, height: sizes.touch, alignItems: "center", justifyContent: "center" },
	scroll: { flexGrow: 0 },
	content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
	footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, gap: spacing.sm },
});
