import { create } from "zustand";

import { duration } from "@/common/theme/tokens";

export type ToastTone = "default" | "success" | "warning" | "danger";

type ToastState = {
	message: string | null;
	tone: ToastTone;
	id: number;
	show: (message: string, tone?: ToastTone) => void;
	hide: () => void;
};

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>((set, get) => ({
	message: null,
	tone: "default",
	id: 0,
	show: (message, tone = "default") => {
		if (timer) clearTimeout(timer);
		const id = get().id + 1;
		set({ message, tone, id });
		timer = setTimeout(() => {
			if (get().id === id) set({ message: null });
		}, duration.toast);
	},
	hide: () => set({ message: null }),
}));

export function showToast(message: string, tone?: ToastTone) {
	useToast.getState().show(message, tone);
}
