import { demoWorkers } from "@/modules/attendance/demo/demo-workers";
import { demoCollectionCentres } from "@/modules/session/demo/demo-estates";

import type { WorkItem } from "../types/workItem";

// Block names and general work categories mirror INITIAL_WORK_ITEMS in the prototype
const blockNames = ["North sector", "West ridge", "South slope", "Hill east"];
const blockLetters = ["A", "C", "B", "A"];
const generalCategories = ["Security", "Cleaning"];
const tappersPerBlock = 5;

function buildWorkItems(): WorkItem[] {
	return demoCollectionCentres.flatMap((centre, centreIndex) => {
		const available = demoWorkers.filter((w) => w.centreId === centre.id && w.status === "present").map((w) => w.id);
		const blocks: WorkItem[] = blockNames.map((name, index) => {
			const seeded = index < 2 ? available.splice(0, tappersPerBlock) : [];
			return {
				id: `${centre.id}-b${index + 1}`,
				code: `B-${centreIndex + 1}${index + 1}${blockLetters[index] ?? "A"}`,
				kind: "tapping",
				name,
				trees: 180 + ((centreIndex * 17 + index * 23) % 80),
				estateId: centre.estateId,
				centreId: centre.id,
				workerIds: seeded,
			};
		});
		const general: WorkItem[] = generalCategories.map((category, index) => ({
			id: `${centre.id}-gw${index + 1}`,
			code: `GW-${String(index + 1).padStart(2, "0")}`,
			kind: "general",
			category,
			estateId: centre.estateId,
			centreId: centre.id,
			workerIds: index === 0 ? available.splice(0, 2) : [],
		}));
		return [...blocks, ...general];
	});
}

export const demoWorkItems: WorkItem[] = buildWorkItems();
