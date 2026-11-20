import { useSafeAreaInsets as useDeviceInsets, type EdgeInsets } from "react-native-safe-area-context";

import "../setup";

export * from "react-native-safe-area-context";

// Inside the preview's phone frame, clear the status bar and gesture bar that preview.html draws
// over the app. Keep these in step with --status-bar and --gesture-bar there.
const FRAME_INSETS: EdgeInsets = { top: 28, right: 0, bottom: 16, left: 0 };

const embedded = (() => {
	try {
		return window.self !== window.top;
	} catch {
		return true;
	}
})();

export function useSafeAreaInsets(): EdgeInsets {
	const insets = useDeviceInsets();
	return embedded ? FRAME_INSETS : insets;
}
