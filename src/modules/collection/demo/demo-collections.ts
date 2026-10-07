import { seededRandom } from "@/common/utils/random";
import { demoWorkItems } from "@/modules/blocks/demo/demo-work-items";

import type { CollectionEntry } from "../types/collection";

const random = seededRandom(57);

function round(value: number): number {
	return Math.round(value * 10) / 10;
}

function buildCollections(): CollectionEntry[] {
	return demoWorkItems
		.filter((item) => item.kind === "tapping")
		.flatMap((block) =>
			block.workerIds.slice(0, 3).map((workerId) => ({
				id: `${block.id}:${workerId}`,
				blockId: block.id,
				workerId,
				latexKg: round(8 + random() * 10),
				drcPercent: Math.round(32 + random() * 8),
				scrapKg: round(random() * 3),
				updatedAt: new Date().toISOString(),
			})),
		);
}

export const demoCollections: CollectionEntry[] = buildCollections();
