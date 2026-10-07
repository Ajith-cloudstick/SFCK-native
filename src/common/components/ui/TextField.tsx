import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { borderWidth, colors, fontFamily, fontSize, radius, sizes, spacing } from "@/common/theme/tokens";

import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type TextFieldProps = Omit<TextInputProps, "style"> & {
	label?: string;
	error?: string | null;
	icon?: IconName;
	trailing?: React.ReactNode;
	ref?: React.Ref<TextInput>;
};

export function TextField({ label, error, icon, trailing, ref, onFocus, onBlur, ...rest }: TextFieldProps) {
	const [focused, setFocused] = useState(false);
	const borderColor = error ? colors.danger.fg : focused ? colors.brand[600] : colors.borderStrong;

	return (
		<View style={styles.wrap}>
			{label ? <Text variant="label" tone="muted">{label}</Text> : null}
			<View style={[styles.field, { borderColor }]}>
				{icon ? <Icon name={icon} color={colors.textSubtle} /> : null}
				<TextInput
					{...rest}
					ref={ref}
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
				{trailing}
			</View>
			{error ? <Text variant="caption" tone="danger">{error}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: spacing.xs },
	field: {
		minHeight: sizes.control,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		paddingHorizontal: spacing.md,
		borderRadius: radius.md,
		borderWidth: borderWidth.thin,
		backgroundColor: colors.surface,
	},
	input: {
		flex: 1,
		minHeight: sizes.control,
		fontFamily: fontFamily.regular,
		fontSize: fontSize.md,
		color: colors.text,
		paddingVertical: spacing.none,
	},
});
