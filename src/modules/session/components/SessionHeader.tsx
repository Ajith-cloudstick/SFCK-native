import { AppHeader } from "@/common/components/layout/AppHeader";
import { useLanguageStore } from "@/common/i18n";
import { formatDate } from "@/common/utils/format";

import { useSession } from "../store/sessionStore";

type SessionHeaderProps = {
	title?: string;
	onBack?: () => void;
};

export function SessionHeader({ title, onBack }: SessionHeaderProps) {
	const language = useLanguageStore((s) => s.language);
	const { centre, estate } = useSession();
	const date = formatDate(new Date(), language);
	const subtitle = title ? `${centre?.name ?? ""} · ${date}` : `${estate?.name ?? ""} · ${date}`;

	return <AppHeader title={title ?? centre?.name ?? ""} subtitle={subtitle} onBack={onBack} />;
}
