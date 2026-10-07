import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { Screen } from "@/common/components/layout/Screen";
import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { Badge } from "@/common/components/ui/Badge";
import { Card } from "@/common/components/ui/Card";
import { ListRow } from "@/common/components/ui/ListRow";
import { SegmentedControl } from "@/common/components/ui/SegmentedControl";
import { Text } from "@/common/components/ui/Text";
import { APP_VERSION } from "@/common/config/appConfig";
import { useLanguageStore, useT, type Language } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import { SessionHeader } from "@/modules/session/components/SessionHeader";
import { useSession, useSessionStore } from "@/modules/session/store/sessionStore";

const languageOptions: { value: Language; label: string }[] = [
	{ value: "en", label: "English" },
	{ value: "ml", label: "മലയാളം" },
];

export default function MorePage() {
	const t = useT();
	const router = useRouter();
	const language = useLanguageStore((s) => s.language);
	const setLanguage = useLanguageStore((s) => s.setLanguage);
	const clear = useSessionStore((s) => s.clear);
	const { estate, centre } = useSession();

	const changeContext = () => {
		clear();
		router.replace("/");
	};

	return (
		<Screen header={<SessionHeader />}>
			<ScrollView contentContainerStyle={styles.content}>
				<SectionTitle title={t("more.language")} />
				<SegmentedControl options={languageOptions} value={language} onChange={setLanguage} />

				<SectionTitle title={t("more.context")} />
				<Card padded={false} style={styles.group}>
					<ListRow icon="map-pin" title={centre?.name ?? ""} subtitle={`${centre?.code ?? ""} · ${estate?.name ?? ""}`} />
					<ListRow icon="repeat" title={t("more.changeContext")} onPress={changeContext} chevron divider={false} />
				</Card>

				<SectionTitle title={t("more.about")} />
				<Card padded={false} style={styles.group}>
					<ListRow icon="refresh-cw" title={t("more.sync")} subtitle={t("common.allSynced")} trailing={<Badge label={t("common.comingSoon")} tone="info" />} disabled />
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
