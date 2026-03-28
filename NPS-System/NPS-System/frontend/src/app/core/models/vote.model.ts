export interface Vote {
  id: number;
  userId: number;
  username: string;
  score: number;
  category: string;
  comment?: string;
  createdAt: Date;
}

export interface CreateVoteRequest {
  score: number;
  comment?: string;
}

export interface NpsResult {
  totalVotes: number;
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
  promoterPercentage: number;
  passivePercentage: number;
  detractorPercentage: number;
  recentVotes: Vote[];
}
