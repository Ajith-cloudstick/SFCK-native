import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Image, Keyboard, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type ScrollViewInstance, type TextInputInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/common/components/ui/Button";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { APP_VERSION } from "@/common/config/appConfig";
import { useT } from "@/common/i18n";
import { userMessage } from "@/common/services/httpClient";
import { shadow } from "@/common/theme/shadows";
import { FadeIn } from "@/common/components/ui/FadeIn";
import { colors, duration, motion, radius, sizes, spacing } from "@/common/theme/tokens";

import { useAuthStore } from "../store/authStore";
import { landingFor } from "../utils/landing";

const logo = require("../../../../assets/images/logo.jpeg");

export default function LoginPage() {
	const t = useT();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { height } = useWindowDimensions();
	const signedIn = useAuthStore((s) => !!s.session);
	const signIn = useAuthStore((s) => s.signIn);
	const selectCentre = useAuthStore((s) => s.selectCentre);
	const passwordRef = useRef<TextInputInstance>(null);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [keyboard, setKeyboard] = useState(0);
	const scrollRef = useRef<ScrollViewInstance>(null);
	const compact = useRef(new Animated.Value(0)).current;
	const panelFull = Math.max(height * sizes.brandPanel, sizes.brandPanelMin);
	const panelSmall = insets.top + sizes.brandPanelCompact;

	useEffect(() => {
		const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
		const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
		const animate = (to: number, ms?: number) =>
			Animated.timing(compact, { toValue: to, duration: ms ?? duration.keyboard, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
		const show = Keyboard.addListener(showEvent, (e) => {
			const overlap = Math.max(0, Dimensions.get("window").height - e.endCoordinates.screenY);
			setKeyboard(overlap || e.endCoordinates.height);
			animate(1, e.duration || undefined);
			setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), duration.keyboard);
		});
		const hide = Keyboard.addListener(hideEvent, (e) => {
			setKeyboard(0);
			animate(0, e?.duration || undefined);
		});
		return () => {
			show.remove();
			hide.remove();
		};
	}, [compact]);

	const panelHeight = compact.interpolate({ inputRange: [0, 1], outputRange: [panelFull, panelSmall] });
	const logoSize = compact.interpolate({ inputRange: [0, 1], outputRange: [sizes.logo, sizes.logo * motion.logoCompact] });
	const collapse = compact.interpolate({ inputRange: [0, 1], outputRange: [sizes.touch, 0] });
	const fadeOut = compact.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: "clamp" });

	if (signedIn && !busy) return <Redirect href="/" />;

	const submit = async () => {
		if (busy) return;
		if (!username.trim() || !password) {
			setError(t("login.missing"));
			return;
		}
		setBusy(true);
		setError(null);
		try {
			const session = await signIn({ username: username.trim(), password, remember });
			const { href, autoCentre } = landingFor(session, useAuthStore.getState().centreId);
			if (autoCentre) selectCentre(autoCentre);
			router.replace(href);
		} catch (e) {
			setError(userMessage(e));
		} finally {
			setBusy(false);
		}
	};

	return (
		<View style={styles.screen}>
			<StatusBar style="light" />
				<ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={[styles.content, { paddingBottom: keyboard }]} keyboardShouldPersistTaps="handled" bounces={false} showsVerticalScrollIndicator={false}>
					<Animated.View style={[styles.brand, { paddingTop: insets.top + spacing.md, height: panelHeight }]}>
						<FadeIn style={styles.brandBody}>
							<Animated.View style={[styles.logoWrap, { width: logoSize, height: logoSize }]}>
								<Image source={logo} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
							</Animated.View>
							<Text variant="title" tone="onBrand" align="center">
								{t("appName")}
							</Text>
							<Animated.View style={{ opacity: fadeOut, maxHeight: collapse }}>
								<Text variant="label" tone="onBrandMuted" align="center">
									{t("orgName")}
								</Text>
							</Animated.View>
						</FadeIn>
					</Animated.View>

					<View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
						<FadeIn delay={duration.stagger * 3} style={styles.form}>
							<View style={styles.heading}>
								<Text variant="title">{t("login.title")}</Text>
								<Text variant="body" tone="muted">
									{t("login.subtitle")}
								</Text>
							</View>

							<TextField
								label={t("login.username")}
								icon="user"
								value={username}
								onChangeText={setUsername}
								placeholder={t("login.usernamePlaceholder")}
								autoCapitalize="none"
								autoCorrect={false}
								autoComplete="username"
								textContentType="username"
								returnKeyType="next"
								onSubmitEditing={() => passwordRef.current?.focus()}
								editable={!busy}
							/>
							<TextField
								ref={passwordRef}
								label={t("login.password")}
								icon="lock"
								value={password}
								onChangeText={setPassword}
								placeholder={t("login.passwordPlaceholder")}
								secureTextEntry={!showPassword}
								autoCapitalize="none"
								autoCorrect={false}
								autoComplete="password"
								textContentType="password"
								returnKeyType="go"
								onSubmitEditing={submit}
								editable={!busy}
								trailing={
									<Pressable
										onPress={() => setShowPassword((v) => !v)}
										style={styles.eye}
										accessibilityRole="button"
										accessibilityLabel={showPassword ? t("login.hidePassword") : t("login.showPassword")}
									>
										<Icon name={showPassword ? "eye-off" : "eye"} color={colors.textMuted} />
									</Pressable>
								}
							/>

							<Pressable
								onPress={() => setRemember((v) => !v)}
								disabled={busy}
								style={styles.remember}
								accessibilityRole="checkbox"
								accessibilityState={{ checked: remember, disabled: busy }}
							>
								<Icon name={remember ? "check-square" : "square"} color={remember ? colors.brand[700] : colors.textMuted} />
								<Text variant="label">{t("login.remember")}</Text>
							</Pressable>

							{error ? (
								<View style={styles.error} accessibilityLiveRegion="polite">
									<Icon name="alert-circle" size="sm" color={colors.danger.fg} />
									<Text variant="label" tone="danger" style={styles.errorText}>
										{error}
									</Text>
								</View>
							) : null}

							<Button label={t("login.submit")} onPress={submit} loading={busy} size="lg" fullWidth />
						</FadeIn>
						<Text variant="caption" tone="subtle" align="center">
							{t("login.version", { version: APP_VERSION })}
						</Text>
					</View>
				</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.brand[700] },
	flex: { flex: 1 },
	content: { flexGrow: 1 },
	brand: { backgroundColor: colors.brand[700], paddingHorizontal: spacing.xl, paddingBottom: spacing.lg + radius.xl, overflow: "hidden" },
	brandBody: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.xs },
	logoWrap: {
		borderRadius: radius.pill,
		backgroundColor: colors.surface,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		marginBottom: spacing.md,
		...shadow("md"),
	},
	// The source image is wide with white margins; oversize it so the artwork fills the circle and the circle clips the blank edges.
	logo: { width: "130%", height: "130%" },
	sheet: {
		flexGrow: 1,
		marginTop: -radius.xl,
		backgroundColor: colors.surface,
		borderTopLeftRadius: radius.xl,
		borderTopRightRadius: radius.xl,
		paddingHorizontal: spacing.xl,
		paddingTop: spacing.xxl,
		gap: spacing.xxl,
		justifyContent: "space-between",
	},
	form: { gap: spacing.lg, width: "100%", maxWidth: sizes.contentMaxWidth, alignSelf: "center" },
	heading: { gap: spacing.xs },
	eye: { width: sizes.touch, height: sizes.touch, alignItems: "center", justifyContent: "center", marginRight: -spacing.md },
	remember: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: sizes.touch, alignSelf: "flex-start" },
	error: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.danger.bg },
	errorText: { flex: 1 },
});
