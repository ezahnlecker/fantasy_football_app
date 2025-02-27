export interface Player {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST';
  team: string;
  status: 'Active' | 'Bench' | 'Injured Reserve';
  opponent?: string;
  opponentRank?: number;
  projectedPoints: number;
  actualPoints: number;
  injuryStatus?: string;
  lineupSlot?: string;
  photoUrl?: string;
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

export interface ESPNTeam {
    id: number;
    name: string;
    abbrev: string;
    record: string;
    pointsFor: number;
    pointsAgainst: number;
    winStreak: number;
    rank: number;
    logo?: string;
    wins: number;
    losses: number;
}