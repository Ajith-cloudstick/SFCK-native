import { useEffect, useRef } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

import { duration, motion } from "@/common/theme/tokens";

type FadeInProps = {
	delay?: number;
	style?: StyleProp<ViewStyle>;
	children: React.ReactNode;
};

// Fades and lifts content in once when it mounts
export function FadeIn({ delay = 0, style, children }: FadeInProps) {
	const progress = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(progress, { toValue: 1, duration: duration.enter, delay, useNativeDriver: true }).start();
	}, [progress, delay]);

	const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [motion.enterOffset, 0] });
	return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
