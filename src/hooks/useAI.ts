import { useState } from 'react';
import { createOpenAIService } from '../services/openaiService';
import type { Player } from '../types';

const openaiService = createOpenAIService();

export function useAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeTrade = async (givingPlayers: Player[], receivingPlayers: Player[]) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await openaiService.analyzeTrade(givingPlayers, receivingPlayers);
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze trade');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeLineup = async (availablePlayers: Player[], positions: Record<string, number>) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const optimization = await openaiService.optimizeLineup(availablePlayers, positions);
      return optimization;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize lineup');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeTrade,
    optimizeLineup,
    isAnalyzing,
    error
  };
}