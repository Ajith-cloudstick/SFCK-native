import { Redirect, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { ListRow } from "@/common/components/ui/ListRow";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { shadow } from "@/common/theme/shadows";
import { borderWidth, colors, radius, sizes, spacing } from "@/common/theme/tokens";

import { useSessionStore } from "../store/sessionStore";

const logo = require("../../../../assets/images/logo.jpeg");

export default function StartPage() {
	const t = useT();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const estates = useSessionStore((s) => s.estates);
	const centres = useSessionStore((s) => s.centres);
	const activeCentreId = useSessionStore((s) => s.centreId);
	const select = useSessionStore((s) => s.select);
	const [estateId, setEstateId] = useState<string | null>(null);
	const [centreId, setCentreId] = useState<string | null>(null);

	const estateCentres = useMemo(() => centres.filter((c) => c.estateId === estateId), [centres, estateId]);

	if (activeCentreId) return <Redirect href="/today" />;

	const chooseEstate = (id: string) => {
		setEstateId(id);
		setCentreId(null);
	};

	const handleContinue = () => {
		if (!estateId || !centreId) return;
		select(estateId, centreId);
		router.replace("/today");
	};

	return (
		<View style={styles.screen}>
			<ScrollView contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]} showsVerticalScrollIndicator={false}>
				<View style={[styles.hero, { paddingTop: insets.top + spacing.xxl }]}>
					<View style={styles.logoWrap}>
						<Image source={logo} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
					</View>
					<Text variant="title" tone="onBrand" align="center">
						{t("appName")}
					</Text>
					<Text variant="label" tone="onBrandMuted" align="center">
						{t("orgName")}
					</Text>
				</View>

				<View style={styles.body}>
					<Text variant="heading">{t("start.title")}</Text>
					<Text variant="body" tone="muted">
						{t("start.subtitle")}
					</Text>

					<SectionTitle title={t("start.estate")} />
					<Card padded={false} style={styles.listCard}>
						{estates.map((estate, index) => (
							<ListRow
								key={estate.id}
								icon="map-pin"
								title={estate.name}
								subtitle={estate.idRange}
								selected={estate.id === estateId}
								divider={index < estates.length - 1}
								onPress={() => chooseEstate(estate.id)}
							/>
						))}
					</Card>

					{estateId ? (
						<>
							<SectionTitle title={t("start.collectionCentre")} />
							<Card padded={false} style={styles.listCard}>
								{estateCentres.map((centre, index) => (
									<ListRow
										key={centre.id}
										icon="droplet"
										title={centre.name}
										subtitle={centre.code}
										selected={centre.id === centreId}
										divider={index < estateCentres.length - 1}
										onPress={() => setCentreId(centre.id)}
									/>
								))}
							</Card>
						</>
					) : null}
				</View>
			</ScrollView>

			<View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
				<Button
					label={estateId ? (centreId ? t("start.continue") : t("start.chooseCentre")) : t("start.chooseEstate")}
					onPress={handleContinue}
					disabled={!estateId || !centreId}
					size="lg"
					fullWidth
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.canvas },
	content: { flexGrow: 1 },
	hero: {
		backgroundColor: colors.brand[700],
		alignItems: "center",
		paddingHorizontal: spacing.xxl,
		paddingBottom: spacing.xxxl,
		gap: spacing.xs,
	},
	logoWrap: {
		width: sizes.logo,
		height: sizes.logo,
		borderRadius: radius.pill,
		backgroundColor: colors.surface,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		marginBottom: spacing.md,
		...shadow("md"),
	},
	logo: { width: sizes.logo - spacing.lg, height: sizes.logo - spacing.lg },
	body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, gap: spacing.xs, width: "100%", maxWidth: sizes.contentMaxWidth, alignSelf: "center" },
	listCard: { overflow: "hidden" },
	footer: {
		paddingHorizontal: spacing.xl,
		paddingTop: spacing.md,
		backgroundColor: colors.surface,
		borderTopWidth: borderWidth.hairline,
		borderTopColor: colors.border,
	},
});
