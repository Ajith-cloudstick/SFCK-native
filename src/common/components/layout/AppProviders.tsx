import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Toast } from "@/common/components/ui/Toast";
import { colors } from "@/common/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type AppProvidersProps = {
	ready?: boolean;
	children: React.ReactNode;
};

export function AppProviders({ ready: appReady = true, children }: AppProvidersProps) {
	const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
	const ready = (loaded || !!error) && appReady;

	useEffect(() => {
		if (ready) SplashScreen.hideAsync().catch(() => undefined);
	}, [ready]);

	if (!ready) return null;

	return (
		<SafeAreaProvider>
			<View style={styles.root}>
				{children}
				<Toast />
			</View>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: colors.canvas },
});
