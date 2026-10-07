import type { CollectionCentre, Estate } from "../types/session";

// Mirrors ESTATES in the prototype's src/data/mockData.js
export const demoEstates: Estate[] = [
	{ id: "cherumppittakavu", name: "Cherumppittakavu", idRange: "3201 – 3400", firstWorkerId: 3201, workerCount: 200 },
	{ id: "kumaramkudy", name: "Kumaramkudy", idRange: "3501 – 3700", firstWorkerId: 3501, workerCount: 200 },
	{ id: "mullumala", name: "Mullumala", idRange: "3801 – 4000", firstWorkerId: 3801, workerCount: 200 },
	{ id: "chithalvetty", name: "Chithalvetty", idRange: "4101 – 4300", firstWorkerId: 4101, workerCount: 200 },
];

export const demoCollectionCentres: CollectionCentre[] = demoEstates.flatMap((estate, index) => [
	{ id: `${estate.id}-cc1`, estateId: estate.id, name: `${estate.name} CC 1`, code: `CC-${index + 1}01` },
	{ id: `${estate.id}-cc2`, estateId: estate.id, name: `${estate.name} CC 2`, code: `CC-${index + 1}02` },
]);
