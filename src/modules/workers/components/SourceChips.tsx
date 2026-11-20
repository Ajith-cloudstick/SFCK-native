import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Chip } from "@/common/components/ui/Chip";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import { useAuthStore } from "@/modules/auth/store/authStore";

import { listMoveEstates } from "../services/workerMoveService";
import type { MoveEstate, WorkerSource } from "../types/workers";

type SourceChipsProps = {
	value: WorkerSource;
	onChange: (value: WorkerSource) => void;
	// the centre's own estate, offered as My estate
	estateId: number | null;
};

// Where workers come from: my estate, another estate or Head Office
export function SourceChips({ value, onChange, estateId }: SourceChipsProps) {
	const t = useT();
	const userId = useAuthStore((s) => s.session?.user.id ?? null);
	const scopeEstates = useAuthStore((s) => s.session?.scope.estates);
	const [estates, setEstates] = useState<MoveEstate[]>(scopeEstates ?? []);

	useEffect(() => {
		if (!userId) return;
		let active = true;
		listMoveEstates(userId)
			.then(({ data }) => {
				if (active) setEstates(data);
			})
			.catch(() => undefined);
		return () => {
			active = false;
		};
	}, [userId]);

	return (
		<View style={styles.group}>
			<Text variant="label" tone="muted">
				{t("workers.from")}
			</Text>
			<View style={styles.chips}>
				<Chip label={t("workers.myEstate")} selected={value.source === "own"} onPress={() => onChange({ source: "own" })} />
				{estates
					.filter((e) => e.id !== estateId)
					.map((e) => (
						<Chip
							key={e.id}
							label={e.name}
							selected={value.source === "estate" && value.source_estate_id === e.id}
							onPress={() => onChange({ source: "estate", source_estate_id: e.id })}
						/>
					))}
				<Chip label={t("workers.headOffice")} selected={value.source === "head_office"} onPress={() => onChange({ source: "head_office" })} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	group: { gap: spacing.sm },
	chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
