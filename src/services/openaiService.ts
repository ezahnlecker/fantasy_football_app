import type { Player } from '../types';

interface TradeAnalysis {
  analysis: string;
  recommendation: 'ACCEPT' | 'DECLINE';
  confidenceScore: number;
  keyFactors: string[];
}

interface LineupOptimization {
  starters: string[];
  bench: string[];
  reasoning: string;
  projectedTotal: number;
  confidenceScore: number;
}

class OpenAIService {
  private readonly API_BASE = '/api/ai';

  async analyzeTrade(givingPlayers: Player[], receivingPlayers: Player[]): Promise<TradeAnalysis> {
    try {
      const response = await fetch(`${this.API_BASE}/analyze-trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ givingPlayers, receivingPlayers })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze trade');
      }

      return response.json();
    } catch (error) {
      console.error('Trade analysis error:', error);
      throw error;
    }
  }

  async optimizeLineup(availablePlayers: Player[], positions: Record<string, number>): Promise<LineupOptimization> {
    try {
      const response = await fetch(`${this.API_BASE}/optimize-lineup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ availablePlayers, positions })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize lineup');
      }

      return response.json();
    } catch (error) {
      console.error('Lineup optimization error:', error);
      throw error;
    }
  }
}

export const createOpenAIService = () => new OpenAIService();