import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useT } from "@/common/i18n";
import { shadow } from "@/common/theme/shadows";
import { colors, duration, radius, sizes, spacing } from "@/common/theme/tokens";

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

// Height of the on-screen keyboard, 0 while it is hidden
function useKeyboardHeight(): number {
	const [keyboard, setKeyboard] = useState(0);
	useEffect(() => {
		// iOS reports before the keyboard moves, Android only after
		const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", (e) => setKeyboard(e.endCoordinates.height));
		const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboard(0));
		return () => {
			show.remove();
			hide.remove();
		};
	}, []);
	return keyboard;
}

// The backdrop fades in place while only the sheet slides up; the Modal stays mounted until the exit finishes
export function BottomSheet({ visible, onClose, title, subtitle, children, footer }: BottomSheetProps) {
	const t = useT();
	const insets = useSafeAreaInsets();
	const { height } = useWindowDimensions();
	const keyboard = useKeyboardHeight();
	const [mounted, setMounted] = useState(visible);
	const progress = useRef(new Animated.Value(0)).current;
	// with the keyboard up the sheet must fit in the space above it, or its top (and the field being typed in) goes off screen
	const maxHeight = keyboard > 0 ? Math.min(height * sizes.sheetMaxHeight, height - keyboard - insets.top - spacing.sm) : height * sizes.sheetMaxHeight;
	// the home indicator is hidden behind the keyboard, so its gap is not needed then
	const paddingBottom = keyboard > 0 ? spacing.sm : insets.bottom + spacing.lg;

	useEffect(() => {
		if (visible) setMounted(true);
		const animation = Animated.timing(progress, {
			toValue: visible ? 1 : 0,
			duration: duration.sheet,
			easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
			useNativeDriver: true,
		});
		animation.start(({ finished }) => {
			if (finished && !visible) setMounted(false);
		});
		return () => animation.stop();
	}, [visible, progress]);

	const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });

	return (
		// iOS keeps a Modal upright unless told otherwise; the app turns with the phone, so the sheet must too
		<Modal
			visible={mounted}
			transparent
			animationType="none"
			onRequestClose={onClose}
			statusBarTranslucent
			navigationBarTranslucent
			supportedOrientations={["portrait", "portrait-upside-down", "landscape", "landscape-left", "landscape-right"]}
		>
			<KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<Animated.View style={[styles.backdrop, { opacity: progress }]}>
					<Pressable style={styles.fill} onPress={onClose} accessibilityRole="button" accessibilityLabel={t("common.close")} />
				</Animated.View>
				<Animated.View style={[styles.sheet, { maxHeight, paddingBottom, transform: [{ translateY }] }]}>
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
					<ScrollView
						style={styles.scroll}
						contentContainerStyle={styles.content}
						keyboardShouldPersistTaps="handled"
						keyboardDismissMode="interactive"
						showsVerticalScrollIndicator={keyboard > 0}
					>
						{children}
					</ScrollView>
					{footer ? <View style={styles.footer}>{footer}</View> : null}
				</Animated.View>
			</KeyboardAvoidingView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, justifyContent: "flex-end" },
	backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
	fill: { flex: 1 },
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
	// shrinks (and scrolls) when the sheet is capped above the keyboard; header and footer stay in view
	scroll: { flexGrow: 0, flexShrink: 1 },
	content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
	footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, gap: spacing.sm },
});
