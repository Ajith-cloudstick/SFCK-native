import { duration } from "@/common/theme/tokens";

// Delay for the n-th row of a list that fades in: a little later each row, capped at the eighth
export const stagger = (index: number): number => Math.min(index, 8) * duration.stagger;
