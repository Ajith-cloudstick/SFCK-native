import type { Collection } from "@/modules/centre/types/centreDay";

import type { CollectionField, CollectionFormErrors, CollectionFormValues, CollectionSums, DryWeights } from "../types/collectionForm";

function round(value: number, places: number): number {
	const factor = 10 ** places;
	return Math.round(value * factor) / factor;
}

// Same rounding as DryRubber on the server
export function computeDry(latexKg: number, drcPercent: number, scrapKg: number, scrapDrcPercent: number): DryWeights {
	const dryLatex = round((latexKg * drcPercent) / 100, 3);
	const dryScrap = round((scrapKg * scrapDrcPercent) / 100, 3);
	return { dryLatex, dryScrap, totalDry: round(dryLatex + dryScrap, 3) };
}

export function sumCollections(rows: Collection[]): CollectionSums {
	return rows.reduce<CollectionSums>(
		(acc, c) => ({
			latexKg: acc.latexKg + c.latex_kg,
			scrapKg: acc.scrapKg + c.scrap_kg,
			dryLatex: acc.dryLatex + c.dry_latex,
			dryScrap: acc.dryScrap + c.dry_scrap,
			totalDry: acc.totalDry + c.total_dry,
		}),
		{ latexKg: 0, scrapKg: 0, dryLatex: 0, dryScrap: 0, totalDry: 0 },
	);
}

export const COLLECTION_LIMITS = { latexMax: 500, drcMin: 1, drcMax: 100, scrapMax: 200 } as const;

export function validateCollection(values: CollectionFormValues): CollectionFormErrors {
	const errors: CollectionFormErrors = {};
	const { latex, drc, scrap } = values;
	if (latex === null || latex < 0 || latex > COLLECTION_LIMITS.latexMax) errors.latex = "collection.latexRange";
	if (scrap === null || scrap < 0 || scrap > COLLECTION_LIMITS.scrapMax) errors.scrap = "collection.scrapRange";
	if ((latex ?? 0) > 0 && (drc === null || drc < COLLECTION_LIMITS.drcMin || drc > COLLECTION_LIMITS.drcMax)) errors.drc = "collection.drcRange";
	if (!errors.latex && !errors.scrap && (latex ?? 0) === 0 && (scrap ?? 0) === 0) errors.form = "collection.bothZero";
	return errors;
}

export function hasErrors(errors: CollectionFormErrors): boolean {
	return (Object.keys(errors) as (CollectionField | "form")[]).some((key) => !!errors[key]);
}
