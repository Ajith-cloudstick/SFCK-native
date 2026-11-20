import { SCRAP_DRY_RATIO } from "@/common/config/appConfig";

import type { CollectionEntry, CollectionTotals, DryRubber } from "../types/collection";

export function computeDryRubber(latexKg: number, drcPercent: number, scrapKg: number): DryRubber {
	const dryLatex = latexKg * (drcPercent / 100);
	const dryScrap = scrapKg * SCRAP_DRY_RATIO;
	return { dryLatex, dryScrap, totalDry: dryLatex + dryScrap };
}

export function sumCollections(entries: CollectionEntry[]): CollectionTotals {
	return entries.reduce<CollectionTotals>(
		(acc, e) => {
			const dry = computeDryRubber(e.latexKg, e.drcPercent, e.scrapKg);
			return {
				latexKg: acc.latexKg + e.latexKg,
				scrapKg: acc.scrapKg + e.scrapKg,
				dryLatex: acc.dryLatex + dry.dryLatex,
				dryScrap: acc.dryScrap + dry.dryScrap,
				totalDry: acc.totalDry + dry.totalDry,
			};
		},
		{ latexKg: 0, scrapKg: 0, dryLatex: 0, dryScrap: 0, totalDry: 0 },
	);
}
