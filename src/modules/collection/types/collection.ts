export type CollectionEntry = {
	id: string;
	blockId: string;
	workerId: string;
	latexKg: number;
	drcPercent: number;
	scrapKg: number;
	updatedAt: string;
};

export type CollectionInput = Pick<CollectionEntry, "blockId" | "workerId" | "latexKg" | "drcPercent" | "scrapKg">;

export type DryRubber = {
	dryLatex: number;
	dryScrap: number;
	totalDry: number;
};

export type CollectionTotals = DryRubber & {
	latexKg: number;
	scrapKg: number;
};
