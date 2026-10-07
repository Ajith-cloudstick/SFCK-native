import Constants from "expo-constants";

export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export const PUSH_BATCH_SIZE = 100;

export const IST_OFFSET_MINUTES = 330;

// Legacy demo constants, remove together with the pending demo files
export const LATE_CUTOFF = { hour: 6, minute: 15 } as const;

export const DEFAULT_DRC_PERCENT = 36;

export const SCRAP_DRY_RATIO = 0.6;
