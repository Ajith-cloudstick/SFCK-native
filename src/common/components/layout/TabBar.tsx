import { useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { usePressScale } from "@/common/hooks/usePressScale";
import { useT, type TranslationKey } from "@/common/i18n";
import { shadow } from "@/common/theme/shadows";
import { colors, duration, fontFamily, radius, sizes, spacing } from "@/common/theme/tokens";

const tabMeta: Record<string, { icon: IconName; label: TranslationKey }> = {
	today: { icon: "home", label: "tabs.today" },
	attendance: { icon: "check-square", label: "tabs.attendance" },
	blocks: { icon: "grid", label: "tabs.blocks" },
	collection: { icon: "droplet", label: "tabs.collection" },
};

const order = ["today", "attendance", "blocks", "collection"];

// Space a scrolling tab screen must leave at the bottom so nothing hides under the floating bar
export function useTabBarSpace(): number {
	const insets = useSafeAreaInsets();
	return insets.bottom + sizes.tabFloatGap + sizes.tabBar + spacing.lg;
}

type TabProps = {
	icon: IconName;
	label: string;
	focused: boolean;
	onPress: () => void;
};

function Tab({ icon, label, focused, onPress }: TabProps) {
	const active = useRef(new Animated.Value(focused ? 1 : 0)).current;
	const press = usePressScale();

	useEffect(() => {
		Animated.timing(active, { toValue: focused ? 1 : 0, duration: duration.enter, useNativeDriver: true }).start();
	}, [active, focused]);

	return (
		<Pressable
			accessibilityRole="tab"
			accessibilityState={{ selected: focused }}
			accessibilityLabel={label}
			onPress={onPress}
			onPressIn={press.onPressIn}
			onPressOut={press.onPressOut}
			style={styles.tab}
		>
			<Animated.View style={[styles.tabInner, { transform: [{ scale: press.scale }] }]}>
				<Icon name={icon} color={focused ? colors.brand[700] : colors.textSubtle} />
				<Text variant="caption" style={[styles.label, focused ? styles.labelActive : null]} numberOfLines={1}>
					{label}
				</Text>
				<Animated.View style={[styles.dot, { opacity: active, transform: [{ scale: active }] }]} />
			</Animated.View>
		</Pressable>
	);
}

export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
	const t = useT();
	const router = useRouter();
	const scanPress = usePressScale();
	const routes = order.map((name) => state.routes.find((r) => r.name === name)).filter((r) => r !== undefined);

	const renderTab = (route: (typeof routes)[number]) => {
		const meta = tabMeta[route.name];
		if (!meta) return null;
		const focused = state.routes[state.index]?.key === route.key;
		const onPress = () => {
			const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
			if (!focused && !event.defaultPrevented) navigateToTab(route.key);
		};
		return <Tab key={route.key} icon={meta.icon} label={t(meta.label)} focused={focused} onPress={onPress} />;
	};

	return (
		<View style={[styles.host, { bottom: insets.bottom + sizes.tabFloatGap }]} pointerEvents="box-none">
			<View style={styles.bar}>
				{routes.slice(0, 2).map(renderTab)}
				<Pressable
					onPress={() => router.push("/scan")}
					onPressIn={scanPress.onPressIn}
					onPressOut={scanPress.onPressOut}
					accessibilityRole="button"
					accessibilityLabel={t("tabs.scan")}
					style={styles.scanSlot}
				>
					<Animated.View style={[styles.scan, { transform: [{ scale: scanPress.scale }] }]}>
						<Icon name="maximize" color={colors.onBrand} />
					</Animated.View>
				</Pressable>
				{routes.slice(2).map(renderTab)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	host: { position: "absolute", left: spacing.lg, right: spacing.lg },
	bar: {
		height: sizes.tabBar,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.xs,
		borderRadius: radius.xl,
		backgroundColor: colors.surface,
		...shadow("lg"),
	},
	tab: { flex: 1, height: "100%", alignItems: "center", justifyContent: "center" },
	tabInner: { alignItems: "center", gap: spacing.xxs },
	label: { color: colors.textSubtle },
	labelActive: { color: colors.brand[700], fontFamily: fontFamily.semibold },
	dot: { width: spacing.xs, height: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.brand[700] },
	scanSlot: { width: sizes.tabScan + spacing.lg, height: "100%", alignItems: "center", justifyContent: "center" },
	scan: {
		width: sizes.tabScan,
		height: sizes.tabScan,
		borderRadius: radius.pill,
		backgroundColor: colors.brand[700],
		alignItems: "center",
		justifyContent: "center",
	},
});
