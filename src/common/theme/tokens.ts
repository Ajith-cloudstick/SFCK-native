import { StyleSheet, type TextStyle } from "react-native";

// Mirrors the SFCK web app design tokens one for one
export const colors = {
	brand: {
		50: "#EEF7F1",
		100: "#D6EDDF",
		200: "#AFDBC0",
		300: "#7FC29B",
		400: "#4FA676",
		500: "#2F8A58",
		600: "#237847",
		700: "#1F6B3B",
		800: "#1A5531",
		900: "#143F25",
		950: "#0B2616",
	},
	canvas: "#F3F5F4",
	surface: "#FFFFFF",
	surfaceMuted: "#F7F9F8",
	border: "#E3E8E5",
	borderStrong: "#CDD5D0",
	text: "#16211B",
	textMuted: "#5B6B62",
	textSubtle: "#8A978F",
	onBrand: "#FFFFFF",
	success: { fg: "#157F3D", bg: "#E7F6EC" },
	warning: { fg: "#A15C07", bg: "#FEF3E2" },
	danger: { fg: "#B42318", bg: "#FDECEA" },
	info: { fg: "#1D5FAF", bg: "#E8F1FC" },
	overlay: "rgba(11, 38, 22, 0.45)",
	onBrandMuted: "rgba(255, 255, 255, 0.78)",
	onBrandTint: "rgba(255, 255, 255, 0.16)",
	transparent: "transparent",
	shadow: "#0B2616",
	camera: "#000000",
	cameraScrim: "rgba(0, 0, 0, 0.55)",
	onCameraMuted: "rgba(255, 255, 255, 0.72)",
} as const;

export const radius = {
	sm: 6,
	md: 10,
	lg: 14,
	xl: 24,
	pill: 999,
} as const;

export const spacing = {
	none: 0,
	xxs: 2,
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 24,
	xxxl: 32,
} as const;

export const fontSize = {
	xs: 12,
	sm: 13,
	base: 15,
	md: 16,
	lg: 18,
	xl: 22,
	xxl: 28,
	display: 34,
} as const;

export const lineHeight = {
	xs: 16,
	sm: 18,
	base: 22,
	md: 22,
	lg: 24,
	xl: 28,
	xxl: 34,
	display: 40,
} as const;

export const fontFamily = {
	regular: "Inter_400Regular",
	medium: "Inter_500Medium",
	semibold: "Inter_600SemiBold",
	bold: "Inter_700Bold",
} as const;

export const fontVariant = {
	tabular: ["tabular-nums"] as TextStyle["fontVariant"],
} as const;

export const sizes = {
	control: 48,
	touch: 48,
	header: 56,
	tabBar: 64,
	tabScan: 48,
	tabFloatGap: 12,
	rowMark: 36,
	blockTag: 44,
	brandPanelCompact: 168,
	tabIndicator: 3,
	tabIndicatorWidth: 28,
	scanButton: 64,
	scanOverhang: 22,
	brandPanel: 0.4,
	brandPanelMin: 260,
	progress: 8,
	fieldLabel: 96,
	avatar: 40,
	avatarSm: 32,
	logo: 96,
	sheetHandle: 40,
	sheetHandleHeight: 4,
	sheetMaxHeight: 0.85,
	scanFrame: 180,
	scanWindow: 250,
	scanCorner: 32,
	statusDot: 8,
	calendarDay: 40,
	contentMaxWidth: 520,
} as const;

export const iconSize = {
	sm: 16,
	md: 20,
	lg: 24,
	xl: 32,
	xxl: 48,
} as const;

export const motion = {
	enterOffset: 12,
	pressScale: 0.94,
	logoCompact: 0.62,
} as const;

export const borderWidth = {
	hairline: StyleSheet.hairlineWidth,
	thin: 1,
	thick: 2,
	heavy: 4,
} as const;

export const opacity = {
	pressed: 0.7,
	muted: 0.55,
	disabled: 0.45,
} as const;

export const duration = {
	toast: 2400,
	fast: 150,
	enter: 240,
	sheet: 260,
	press: 120,
	stagger: 40,
	keyboard: 220,
	scanDebounce: 2500,
	syncInterval: 60000,
	requestTimeout: 20000,
} as const;

export const tokens = { colors, radius, spacing, fontSize, lineHeight, fontFamily, fontVariant, sizes, iconSize, borderWidth, opacity, duration, motion } as const;
