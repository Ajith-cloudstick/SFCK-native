import { StyleSheet, View } from "react-native";

import { colors, radius, sizes } from "@/common/theme/tokens";

import { Text } from "./Text";

type AvatarProps = {
	initials: string;
	active?: boolean;
	small?: boolean;
};

export function Avatar({ initials, active, small }: AvatarProps) {
	const size = small ? sizes.avatarSm : sizes.avatar;
	return (
		<View style={[styles.avatar, { width: size, height: size, backgroundColor: active ? colors.brand[700] : colors.brand[50] }]}>
			<Text variant="label" tone={active ? "onBrand" : "brand"}>
				{initials}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	avatar: { borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
});
