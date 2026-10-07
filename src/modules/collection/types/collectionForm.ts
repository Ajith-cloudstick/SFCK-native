import type { TranslationKey } from "@/common/i18n";

export type DryWeights = {
	dryLatex: number;
	dryScrap: number;
	totalDry: number;
};

export type CollectionSums = DryWeights & {
	latexKg: number;
	scrapKg: number;
};

export type CollectionField = "latex" | "drc" | "scrap";

export type CollectionFormValues = Record<CollectionField, number | null>;

export type CollectionFormErrors = Partial<Record<CollectionField | "form", TranslationKey>>;
