import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { borderWidth, colors, fontFamily, fontSize, fontVariant, radius, sizes, spacing } from "@/common/theme/tokens";

import { Text } from "./Text";

type NumberFieldProps = Omit<TextInputProps, "style" | "keyboardType" | "value" | "onChangeText"> & {
	label: string;
	value: string;
	onChangeText: (value: string) => void;
	unit?: string;
	error?: string | null;
	decimals?: boolean;
};

export function NumberField({ label, value, onChangeText, unit, error, decimals = true, onFocus, onBlur, ...rest }: NumberFieldProps) {
	const [focused, setFocused] = useState(false);
	const borderColor = error ? colors.danger.fg : focused ? colors.brand[600] : colors.borderStrong;

	const handleChange = (next: string) => {
		const cleaned = next.replace(",", ".").replace(decimals ? /[^0-9.]/g : /[^0-9]/g, "");
		const [whole, ...fraction] = cleaned.split(".");
		onChangeText(fraction.length ? `${whole}.${fraction.join("")}` : cleaned);
	};

	return (
		<View style={styles.wrap}>
			<Text variant="label" tone="muted">
				{label}
			</Text>
			<View style={[styles.field, { borderColor }]}>
				<TextInput
					{...rest}
					value={value}
					onChangeText={handleChange}
					keyboardType={decimals ? "decimal-pad" : "number-pad"}
					inputMode={decimals ? "decimal" : "numeric"}
					placeholderTextColor={colors.textSubtle}
					selectionColor={colors.brand[600]}
					onFocus={(e) => {
						setFocused(true);
						onFocus?.(e);
					}}
					onBlur={(e) => {
						setFocused(false);
						onBlur?.(e);
					}}
					style={styles.input}
				/>
				{unit ? (
					<Text variant="bodyStrong" tone="muted" style={styles.unit}>
						{unit}
					</Text>
				) : null}
			</View>
			{error ? (
				<Text variant="caption" tone="danger">
					{error}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { flex: 1, gap: spacing.xs },
	field: {
		minHeight: sizes.header,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		paddingHorizontal: spacing.md,
		borderRadius: radius.md,
		borderWidth: borderWidth.thin,
		backgroundColor: colors.surface,
	},
	// minWidth 0 lets the input shrink beside the unit (browsers give inputs an intrinsic width)
	input: {
		flex: 1,
		minWidth: 0,
		minHeight: sizes.header,
		fontFamily: fontFamily.semibold,
		fontSize: fontSize.xl,
		fontVariant: fontVariant.tabular,
		color: colors.text,
		paddingVertical: spacing.none,
	},
	unit: { flexShrink: 0 },
});
