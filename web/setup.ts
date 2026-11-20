import { Alert, type AlertButton, type AlertOptions } from "react-native";

import { colors } from "@/common/theme/tokens";

// Runs once when the web preview starts (imported by shims/safe-area-context.ts).
// Makes the browser behave like the phone: no desktop scrollbars, no tap highlight, and
// Alert.alert shown as an Android dialog (react-native-web's Alert.alert does nothing).

const PHONE_CSS = `
html, body { overscroll-behavior: none; }
* { scrollbar-width: none; -webkit-tap-highlight-color: transparent; user-select: none; }
*::-webkit-scrollbar { display: none; width: 0; height: 0; }
input, textarea, [contenteditable="true"] { user-select: text; }
/* Phones draw no focus ring; the fields keep their own green focus border from TextField/NumberField */
*:focus, *:focus-visible { outline: none !important; }

.sfck-dialog-scrim {
	position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center;
	padding: 24px; background: rgba(0, 0, 0, 0.32); animation: sfck-fade 150ms ease-out;
}
.sfck-dialog {
	width: 100%; max-width: 312px; box-sizing: border-box; padding: 24px 24px 18px; border-radius: 28px;
	background: ${colors.surface}; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
	font-family: Roboto, Inter_400Regular, system-ui, sans-serif; animation: sfck-pop 180ms cubic-bezier(0.2, 0, 0, 1);
}
.sfck-dialog h2 { margin: 0 0 16px; font-size: 22px; line-height: 28px; font-weight: 400; color: ${colors.text}; }
.sfck-dialog p { margin: 0 0 24px; font-size: 14px; line-height: 20px; color: ${colors.textMuted}; white-space: pre-wrap; }
.sfck-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; }
.sfck-dialog-actions .sfck-neutral { margin-right: auto; }
.sfck-dialog button {
	min-height: 40px; padding: 0 12px; border: 0; border-radius: 20px; background: transparent; cursor: pointer;
	font: 500 14px/20px Roboto, Inter_500Medium, system-ui, sans-serif; color: ${colors.brand[700]};
}
.sfck-dialog button:hover { background: ${colors.brand[50]}; }
.sfck-dialog button:active { background: ${colors.brand[100]}; }
@keyframes sfck-fade { from { opacity: 0; } }
@keyframes sfck-pop { from { opacity: 0; transform: scale(0.92); } }
`;

function injectStyles(): void {
	const style = document.createElement("style");
	style.setAttribute("data-sfck-web-preview", "");
	style.textContent = PHONE_CSS;
	document.head.appendChild(style);
}

// Same button rules as Android: one button is positive; two are negative + positive;
// three are neutral (left) + negative + positive. Tapping outside only closes when cancelable.
function showAndroidAlert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions): void {
	const list = buttons && buttons.length > 0 ? buttons.slice(0, 3) : [{ text: "OK" }];
	const scrim = document.createElement("div");
	scrim.className = "sfck-dialog-scrim";
	const dialog = document.createElement("div");
	dialog.className = "sfck-dialog";
	dialog.setAttribute("role", "alertdialog");

	const heading = document.createElement("h2");
	heading.textContent = title;
	dialog.appendChild(heading);
	if (message) {
		const body = document.createElement("p");
		body.textContent = message;
		dialog.appendChild(body);
	}

	const close = (button?: AlertButton) => {
		scrim.remove();
		button?.onPress?.();
	};

	const actions = document.createElement("div");
	actions.className = "sfck-dialog-actions";
	list.forEach((button, index) => {
		const element = document.createElement("button");
		element.type = "button";
		element.textContent = button.text ?? "OK";
		if (list.length === 3 && index === 0) element.className = "sfck-neutral";
		element.addEventListener("click", () => close(button));
		actions.appendChild(element);
	});
	dialog.appendChild(actions);

	scrim.addEventListener("click", (event) => {
		if (event.target !== scrim || !options?.cancelable) return;
		scrim.remove();
		options.onDismiss?.();
	});
	scrim.appendChild(dialog);
	document.body.appendChild(scrim);
}

// Expo answers "/" before web/metro.js can serve the phone frame, so a desktop-width top window
// that opened "/" moves to /preview, which shows the frame with this app inside it
function openFrameForStartPage(): boolean {
	const isTop = (() => {
		try {
			return window.self === window.top;
		} catch {
			return false;
		}
	})();
	const params = new URLSearchParams(window.location.search);
	if (!isTop || window.location.pathname !== "/" || params.get("frame") === "off" || window.innerWidth < 600) return false;
	window.location.replace(`/preview${window.location.search}`);
	return true;
}

if (typeof document !== "undefined" && !openFrameForStartPage()) {
	injectStyles();
	Alert.alert = showAndroidAlert;
}
