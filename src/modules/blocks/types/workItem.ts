type WorkItemBase = {
	id: string;
	code: string;
	estateId: string;
	centreId: string;
	workerIds: string[];
};

export type TappingBlock = WorkItemBase & {
	kind: "tapping";
	name: string;
	trees: number;
};

export type GeneralWork = WorkItemBase & {
	kind: "general";
	category: string;
};

export type WorkItem = TappingBlock | GeneralWork;

export type BlocksView = "unassigned" | "assignments";
