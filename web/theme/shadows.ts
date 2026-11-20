import type { ViewStyle } from "react-native";

// Web version of src/common/theme/shadows.ts. The phone app uses Android elevation, which the
// browser ignores, so draw the same depth as box-shadow. Keep the exports in step with the original.
export type ShadowLevel = "none" | "sm" | "md" | "lg";

const tint = (alpha: number) => `rgba(11, 38, 22, ${alpha})`;

const web: Record<ShadowLevel, ViewStyle> = {
	none: {},
	sm: { boxShadow: `0px 1px 2px ${tint(0.1)}, 0px 1px 3px ${tint(0.08)}` },
	md: { boxShadow: `0px 2px 4px ${tint(0.08)}, 0px 4px 10px ${tint(0.1)}` },
	lg: { boxShadow: `0px 6px 12px ${tint(0.1)}, 0px 12px 28px ${tint(0.16)}` },
};

export function shadow(level: ShadowLevel): ViewStyle {
	return web[level];
}
