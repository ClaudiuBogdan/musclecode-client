export interface UserStats {
  totalSolved: number;
  streak: number;
  ranking: number;
  points: number;
}

export interface Activity {
  id: string;
  type: "SOLVED" | "ATTEMPTED" | "EARNED_BADGE";
  algorithmId?: string;
  algorithmTitle?: string;
  badgeId?: string;
  badgeTitle?: string;
  timestamp: string;
}

export interface ProgressData {
  dates: string[];
  solved: number[];
}

export interface Algorithm {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  completionRate: number;
}
