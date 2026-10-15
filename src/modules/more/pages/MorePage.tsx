import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { Screen } from "@/common/components/layout/Screen";
import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { Card } from "@/common/components/ui/Card";
import { ListRow } from "@/common/components/ui/ListRow";
import { SegmentedControl } from "@/common/components/ui/SegmentedControl";
import { Text } from "@/common/components/ui/Text";
import { APP_VERSION } from "@/common/config/appConfig";
import { useLanguageStore, useT, type Language } from "@/common/i18n";
import { useSyncSummary } from "@/common/sync/syncStore";
import { spacing } from "@/common/theme/tokens";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { CentreHeader } from "@/modules/centre/components/CentreHeader";
import { useCentreDayStore } from "@/modules/centre/store/centreDayStore";

const languageOptions: { value: Language; label: string }[] = [
	{ value: "en", label: "English" },
	{ value: "ml", label: "മലയാളം" },
];

export default function MorePage() {
	const t = useT();
	const router = useRouter();
	const language = useLanguageStore((s) => s.language);
	const setLanguage = useLanguageStore((s) => s.setLanguage);
	const session = useAuthStore((s) => s.session);
	const day = useCentreDayStore((s) => s.serverDay);
	const { pending, failed } = useSyncSummary();
	const manyCentres = (session?.scope.ccs.length ?? 0) > 1;

	return (
		<Screen header={<CentreHeader />}>
			<ScrollView contentContainerStyle={styles.content}>
				<SectionTitle title={t("more.language")} />
				<SegmentedControl options={languageOptions} value={language} onChange={setLanguage} />

				<SectionTitle title={t("more.context")} />
				<Card padded={false} style={styles.group}>
					<ListRow icon="user" title={session?.user.name ?? ""} subtitle={session?.user.role.name ?? ""} />
					<ListRow
						icon="map-pin"
						title={day?.centre.name ?? ""}
						subtitle={[day?.division?.name, day?.estate?.name].filter(Boolean).join(" · ")}
						onPress={manyCentres ? () => router.push("/choose-centre") : undefined}
						chevron={manyCentres}
						divider={false}
					/>
				</Card>

				<SectionTitle title={t("more.about")} />
				<Card padded={false} style={styles.group}>
					<ListRow icon="refresh-cw" title={t("sync.centre")} subtitle={failed > 0 ? t("sync.failedCount", { count: failed }) : pending > 0 ? t("sync.pending", { count: pending }) : t("sync.synced")} />
					<ListRow icon="info" title={t("more.version")} trailing={<Text variant="bodyStrong" tone="muted" tabular>{APP_VERSION}</Text>} divider={false} />
				</Card>

				<Text variant="caption" tone="subtle" align="center" style={styles.footer}>
					{`${t("appName")} · ${t("orgName")}`}
				</Text>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
	group: { overflow: "hidden" },
	footer: { marginTop: spacing.xxl },
});
