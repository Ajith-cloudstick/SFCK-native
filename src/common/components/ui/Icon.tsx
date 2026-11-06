import Feather from "@expo/vector-icons/Feather";

import { colors, iconSize } from "@/common/theme/tokens";

export type IconName =
	| "home"
	| "check-square"
	| "square"
	| "grid"
	| "droplet"
	| "more-horizontal"
	| "search"
	| "x"
	| "check"
	| "chevron-right"
	| "chevron-left"
	| "chevron-down"
	| "maximize"
	| "calendar"
	| "camera"
	| "hash"
	| "user-plus"
	| "repeat"
	| "edit-2"
	| "plus"
	| "alert-circle"
	| "clock"
	| "users"
	| "map-pin"
	| "globe"
	| "refresh-cw"
	| "info"
	| "cloud"
	| "inbox"
	| "layers"
	| "tool"
	| "user"
	| "lock"
	| "eye"
	| "eye-off"
	| "log-out"
	| "zap"
	| "zap-off"
	| "wifi-off"
	| "alert-triangle"
	| "rotate-ccw"
	| "trash-2"
	| "briefcase"
	| "check-circle"
	| "credit-card"
	| "upload-cloud";

type IconProps = {
	name: IconName;
	size?: keyof typeof iconSize;
	color?: string;
};

export function Icon({ name, size = "md", color = colors.text }: IconProps) {
	return <Feather name={name} size={iconSize[size]} color={color} />;
}
