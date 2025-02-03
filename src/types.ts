export interface Player {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST';
  team: string;
  opponent?: string;
  opponentRank?: number;
  projectedPoints: number;
  seasonRank?: number;
  trend?: number;
  photoUrl?: string;
  status: 'active' | 'injured' | 'questionable';
}

export interface TradeAnalysis {
  giving: Player[];
  receiving: Player[];
  givingStrength: number;
  receivingStrength: number;
  recommendation: string;
  confidenceScore: number;
}

export interface LineupRecommendation {
  starters: Player[];
  bench: Player[];
  reasoning: string;
}