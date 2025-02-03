import React from 'react';
import { Users, RefreshCw, AlertCircle, Wand2 } from 'lucide-react';
import PlayerCard from './PlayerCard';
import { useESPN } from '../context/ESPNContext';
import { useAI } from '../hooks/useAI';
import type { Player } from '../types';

const positions = {
  QB: { count: 1, label: 'Quarterback' },
  RB: { count: 2, label: 'Running Back' },
  WR: { count: 2, label: 'Wide Receiver' },
  TE: { count: 1, label: 'Tight End' },
  FLEX: { count: 1, label: 'Flex (RB/WR/TE)' },
  DST: { count: 1, label: 'Defense/Special Teams' }
};

export default function LineupOptimizer() {
  const { roster, isLoading, error, refreshRoster, isConnected } = useESPN();
  const { optimizeLineup, isAnalyzing } = useAI();

  const handleOptimize = async () => {
    if (!roster) return;
    
    try {
      const optimization = await optimizeLineup(roster, positions);
      // Handle optimization result
      console.log(optimization);
    } catch (err) {
      console.error('Failed to optimize lineup:', err);
    }
  };

  const getPlayersForPosition = (pos: string) => {
    if (!roster) return [];
    return roster.filter(player => {
      if (pos === 'FLEX') {
        return ['RB', 'WR', 'TE'].includes(player.position);
      }
      return player.position === pos;
    });
  };

  const getBenchPlayers = () => {
    if (!roster) return [];
    return roster.filter(player => 
      !Object.keys(positions).some(pos => 
        getPlayersForPosition(pos).includes(player)
      )
    );
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Loading Roster</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={refreshRoster}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Lineup Optimizer</h2>
        </div>
        <div className="flex items-center space-x-3">
          {isConnected && (
            <>
              <button
                onClick={refreshRoster}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
              <button 
                onClick={handleOptimize}
                disabled={isAnalyzing || !roster}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-4 h-4" />
                <span>Optimize Lineup</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            Connect your ESPN account in Settings to optimize your lineup and get AI-powered recommendations.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Starting Lineup</h3>
          {Object.entries(positions).map(([pos, info]) => (
            <div key={pos} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">{info.label}</h4>
              {Array(info.count).fill(null).map((_, idx) => {
                const availablePlayers = getPlayersForPosition(pos);
                return availablePlayers.length > idx ? (
                  <PlayerCard 
                    key={`${pos}-${idx}`}
                    player={availablePlayers[idx]} 
                    showOpponent 
                  />
                ) : (
                  <div key={`${pos}-${idx}`} className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <p className="text-gray-500 text-center">
                      {isConnected ? `Select ${info.label}` : 'Connect to view players'}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Bench</h3>
          <div className="space-y-3">
            {getBenchPlayers().map(player => (
              <PlayerCard 
                key={player.id} 
                player={player}
                showOpponent
              />
            ))}
            {(!isConnected || getBenchPlayers().length === 0) && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  {isConnected ? 'No bench players available' : 'Connect to view bench players'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}