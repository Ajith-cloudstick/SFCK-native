import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

import { duration, motion } from "@/common/theme/tokens";

type FadeInProps = {
	delay?: number;
	style?: StyleProp<ViewStyle>;
	children: React.ReactNode;
};

// Fades and lifts content in each time its screen comes into view (tab screens stay mounted, so mounting alone is not enough)
export function FadeIn({ delay = 0, style, children }: FadeInProps) {
	const progress = useRef(new Animated.Value(0)).current;

	useFocusEffect(
		useCallback(() => {
			progress.setValue(0);
			const animation = Animated.timing(progress, { toValue: 1, duration: duration.enter, delay, useNativeDriver: true });
			animation.start();
			return () => animation.stop();
		}, [progress, delay]),
	);

	const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [motion.enterOffset, 0] });
	return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
