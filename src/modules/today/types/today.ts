import type { IconName } from "@/common/components/ui/Icon";
import type { BadgeTone } from "@/common/components/ui/Badge";

export type PendingTarget = "/attendance" | "/blocks" | "/collection";

export type PendingItem = {
	id: string;
	icon: IconName;
	tone: BadgeTone;
	message: string;
	target: PendingTarget;
};
