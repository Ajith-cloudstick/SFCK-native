import { Redirect, useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/common/components/layout/AppHeader";
import { Screen } from "@/common/components/layout/Screen";
import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { ListRow } from "@/common/components/ui/ListRow";
import { useT } from "@/common/i18n";
import { sizes, spacing } from "@/common/theme/tokens";

import { useSignOut } from "../hooks/useSignOut";
import { useAuthStore } from "../store/authStore";
import type { ScopeCentre } from "../types/auth";

export default function ChooseCentrePage() {
	const t = useT();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = useAuthStore((s) => s.session);
	const currentId = useAuthStore((s) => s.centreId);
	const selectCentre = useAuthStore((s) => s.selectCentre);
	const signOut = useSignOut();

	const groups = useMemo(() => {
		if (!session) return [];
		const { ccs, divisions, estates } = session.scope;
		const keys = [...new Set(ccs.map((c) => c.division_id))];
		return keys.map((divisionId) => {
			const division = divisions.find((d) => d.id === divisionId);
			const centres = ccs.filter((c) => c.division_id === divisionId);
			const estate = estates.find((e) => e.id === (division?.estate_id ?? centres[0]?.estate_id));
			return { key: String(divisionId), title: [estate?.name, division?.name].filter(Boolean).join(" · "), centres };
		});
	}, [session]);

	if (!session) return <Redirect href="/login" />;

	const choose = (centre: ScopeCentre) => {
		const fromTabs = !!currentId && router.canGoBack();
		selectCentre(centre.id);
		if (fromTabs) router.back();
		else router.replace("/today");
	};

	return (
		<Screen
			header={
				<AppHeader
					title={t("centre.chooseTitle")}
					subtitle={`${session.user.name} · ${session.user.role.name}`}
					onBack={currentId && router.canGoBack() ? () => router.back() : undefined}
				/>
			}
		>
			<ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]} showsVerticalScrollIndicator={false}>
				{groups.length === 0 ? (
					<EmptyState icon="map-pin" title={t("centre.noneTitle")} body={t("centre.noneBody")} />
				) : (
					groups.map((group) => (
						<View key={group.key}>
							<SectionTitle title={group.title || t("centre.centres")} />
							<Card padded={false} style={styles.group}>
								{group.centres.map((centre, index) => (
									<ListRow
										key={centre.id}
										icon="droplet"
										title={centre.name}
										subtitle={centre.code ?? undefined}
										selected={centre.id === currentId}
										divider={index < group.centres.length - 1}
										chevron={centre.id !== currentId}
										onPress={() => choose(centre)}
									/>
								))}
							</Card>
						</View>
					))
				)}
				<Button label={t("account.signOut")} icon="log-out" variant="ghost" onPress={() => void signOut()} style={styles.signOut} />
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	content: { padding: spacing.lg, width: "100%", maxWidth: sizes.contentMaxWidth, alignSelf: "center" },
	group: { overflow: "hidden" },
	signOut: { marginTop: spacing.xxl, alignSelf: "center" },
});
