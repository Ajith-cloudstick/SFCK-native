import { Platform, type ViewStyle } from "react-native";

import { colors } from "./tokens";

export type ShadowLevel = "none" | "sm" | "md" | "lg";

const ios: Record<ShadowLevel, ViewStyle> = {
	none: {},
	sm: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
	md: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
	lg: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.14, shadowRadius: 24 },
};

const android: Record<ShadowLevel, ViewStyle> = {
	none: { elevation: 0 },
	sm: { elevation: 1, shadowColor: colors.shadow },
	md: { elevation: 4, shadowColor: colors.shadow },
	lg: { elevation: 12, shadowColor: colors.shadow },
};

export function shadow(level: ShadowLevel): ViewStyle {
	return Platform.OS === "ios" ? ios[level] : android[level];
}
