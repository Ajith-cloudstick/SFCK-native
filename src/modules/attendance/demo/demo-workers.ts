import { seededRandom } from "@/common/utils/random";
import { demoCollectionCentres, demoEstates } from "@/modules/session/demo/demo-estates";

import type { Worker } from "../types/worker";

// Name pools mirror the prototype's src/data/mockData.js
const firstNames = ["Rajan", "Soman", "Gopi", "Babu", "Mohan", "Suresh", "Ramesh", "Ravi", "Unni", "Hari", "Radha", "Latha", "Mini", "Saly", "Bindu", "Maya", "Geetha", "Sriya", "Anil", "Praman", "Biju", "Manoj", "Sree", "Deepa", "Resmi", "Anu", "Jyothi", "Kala", "Sindhu", "Ajith"];
const lastNames = ["K.", "T.", "Menon", "Nair", "Pillai", "V.", "R.", "S.", "M.", "P.", "C.", "Kumar", "Das", "Varma"];

const random = seededRandom(20260706);

function pick<T>(list: T[]): T {
	return list[Math.floor(random() * list.length)] as T;
}

function buildWorkers(): Worker[] {
	return demoEstates.flatMap((estate) => {
		const centres = demoCollectionCentres.filter((c) => c.estateId === estate.id);
		return Array.from({ length: estate.workerCount }, (_, index) => {
			const first = pick(firstNames);
			const last = pick(lastNames);
			const centre = centres[index % centres.length];
			const present = random() < 0.55;
			const late = present && random() < 0.12;
			return {
				id: String(estate.firstWorkerId + index),
				name: `${first} ${last}`,
				initials: `${first.charAt(0)}${last.charAt(0)}`,
				estateId: estate.id,
				centreId: centre?.id ?? "",
				status: present ? "present" : "pending",
				isLate: late,
				markedAt: present ? new Date().toISOString() : null,
			};
		});
	});
}

export const demoWorkers: Worker[] = buildWorkers();
