export type Estate = {
	id: string;
	name: string;
	idRange: string;
	firstWorkerId: number;
	workerCount: number;
};

export type CollectionCentre = {
	id: string;
	estateId: string;
	name: string;
	code: string;
};
