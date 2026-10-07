import { useRef } from "react";
import { Animated } from "react-native";

import { duration, motion } from "@/common/theme/tokens";

// Small press-in shrink for tappable surfaces
export function usePressScale() {
	const scale = useRef(new Animated.Value(1)).current;
	const to = (value: number) => Animated.timing(scale, { toValue: value, duration: duration.press, useNativeDriver: true }).start();
	return { scale, onPressIn: () => to(motion.pressScale), onPressOut: () => to(1) };
}
