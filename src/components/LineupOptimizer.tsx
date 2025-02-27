import React, { useEffect } from 'react';
import { Users, RefreshCw, AlertCircle, Wand2 } from 'lucide-react';
import PlayerCard from './PlayerCard';
import { useESPN } from '../context/ESPNContext';
import { useAI } from '../hooks/useAI';
import type { Player } from '../types';

interface PositionConfig {
  count: number;
  label: string;
}

const positions: Record<string, PositionConfig> = {
  QB: { count: 1, label: 'Quarterback' },
  RB: { count: 2, label: 'Running Back' },
  WR: { count: 2, label: 'Wide Receiver' },
  TE: { count: 1, label: 'Tight End' },
  FLEX: { count: 1, label: 'Flex (RB/WR/TE)' },
  DST: { count: 1, label: 'Defense/Special Teams' }
};

export default function LineupOptimizer() {
  const { 
    isConnected, 
    roster, 
    selectedTeamId, 
    teams, 
    isLoading, 
    error, 
    refreshRoster,
    selectedWeek,
    setSelectedWeek 
  } = useESPN();
  const { optimizeLineup, isAnalyzing } = useAI();

  // Add week options
  const weekOptions = Array.from({ length: 18 }, (_, i) => i + 1);

  useEffect(() => {
    if (roster.length > 0) {
      console.log('Current roster:', roster);
    }
  }, [roster]);

  useEffect(() => {
    console.log('LineupOptimizer state:', {
        isConnected,
        selectedTeamId,
        rosterLength: roster?.length,
        isLoading,
        error
    });
  }, [isConnected, selectedTeamId, roster, isLoading, error]);

  useEffect(() => {
    if (selectedTeamId && !roster.length && !isLoading && !error) {
        refreshRoster();
    }
  }, [selectedTeamId]); // Only run when selectedTeamId changes

  if (isConnected && !selectedTeamId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            Please select your team in Settings to optimize your lineup.
          </p>
        </div>
      </div>
    );
  }

  const selectedTeam = teams?.find(t => t.id === selectedTeamId);

  const handleOptimize = async () => {
    if (!roster) return;
    
    try {
      // Convert positions to the format expected by optimizeLineup
      const positionCounts = Object.entries(positions).reduce((acc, [pos, config]) => {
        acc[pos] = config.count;
        return acc;
      }, {} as Record<string, number>);

      const optimization = await optimizeLineup(roster, positionCounts);
      // Handle optimization result
      console.log(optimization);
    } catch (err) {
      console.error('Failed to optimize lineup:', err);
    }
  };

  const getPlayersForPosition = (pos: string) => {
    if (!roster || !Array.isArray(roster)) {
      console.error('Invalid roster:', roster);
      return [];
    }
    return roster.filter(player => {
      // Only include active players in the main lineup
      if (player.status !== 'Active') return false;
      
      // For FLEX, only show players specifically in the FLEX slot
      if (pos === 'FLEX') {
        return player.lineupSlot === 'RB/WR/TE';
      }
      // Special handling for DST
      if (pos === 'DST') {
        return player.lineupSlot === 'D/ST' || player.position === 'DST';
      }
      // For other positions, check both position and lineup slot
      return player.position === pos && player.lineupSlot === pos;
    });
  };

  const getBenchPlayers = () => {
    if (!roster || !Array.isArray(roster)) {
      console.error('Invalid roster:', roster);
      return [];
    }
    // Return all bench and IR players
    return roster.filter(player => player.status === 'Bench' || player.status === 'Injured Reserve');
  };

  const calculateTotals = () => {
    const activePlayers = Object.entries(positions).flatMap(([pos]) => 
      getPlayersForPosition(pos)
    );

    return {
      projectedTotal: activePlayers.reduce((sum, player) => sum + player.projectedPoints, 0),
      actualTotal: activePlayers.reduce((sum, player) => sum + player.actualPoints, 0)
    };
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
          <h2 className="text-xl font-bold text-gray-800">
            {selectedTeam ? selectedTeam.name : 'My Team'} Lineup
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* Week Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="week-select" className="text-sm font-medium text-gray-700">
              Week
            </label>
            <select
              id="week-select"
              value={selectedWeek}
              onChange={async (e) => {
                const newWeek = Number(e.target.value);
                setSelectedWeek(newWeek);
                if (selectedTeamId) {
                  await refreshRoster();
                }
              }}
              className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {weekOptions.map(week => (
                <option key={week} value={week}>
                  {week}
                </option>
              ))}
            </select>
          </div>
          
          {/* Existing Refresh/Optimize buttons */}
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

      <div className="space-y-4">
        {/* Column Headers */}
        <div className="flex items-center px-4 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex-1 flex items-center">
            <div className="w-12">Slot</div>
            <div className="w-8" /> {/* Space for photo */}
            <div className="flex-1 ml-3">Player</div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="w-12 text-right">Proj</div>
            <div className="w-12 text-right">Points</div>
          </div>
          <div className="w-24 flex justify-end">
            <div className="w-12 text-right">Opp</div>
            <div className="w-12 text-right">Rank</div>
          </div>
        </div>

        {/* Starting Lineup Section */}
        <div className="bg-white border rounded-lg divide-y">
          {Object.entries(positions).map(([pos, info]) => (
            Array(info.count).fill(null).map((_, idx) => {
              const availablePlayers = getPlayersForPosition(pos);
              return availablePlayers.length > idx ? (
                <PlayerCard 
                  key={`${pos}-${idx}`}
                  player={availablePlayers[idx]} 
                  showOpponent
                  slot={pos}
                />
              ) : (
                <div key={`${pos}-${idx}`} className="flex items-center py-2 px-4">
                  <div className="w-12 text-xs font-medium text-gray-500 uppercase">
                    {pos}
                  </div>
                  <span className="text-sm text-gray-500">
                    {isConnected ? `Select ${info.label}` : 'Connect to view players'}
                  </span>
                </div>
              );
            })
          ))}

          {/* Totals Row */}
          <div className="flex items-center justify-between py-2 px-4 bg-gray-50 font-medium">
            <div className="flex-1 flex items-center">
              <div className="flex-1" />
              <div className="text-xs font-medium text-gray-500 uppercase mr-4">
                Total
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="w-12 text-right text-gray-600">
                {calculateTotals().projectedTotal.toFixed(1)}
              </div>
              <div className="w-12 text-right">
                {calculateTotals().actualTotal.toFixed(1)}
              </div>
            </div>
            <div className="w-24" /> {/* Space for opponent columns */}
          </div>
        </div>

        {/* Bench Section */}
        <div className="bg-white border rounded-lg divide-y">
          {getBenchPlayers().map(player => (
            <PlayerCard 
              key={player.id} 
              player={player}
              showOpponent
              slot="BE"  // Show "BE" for bench players
            />
          ))}
          {getBenchPlayers().length === 0 && (
            <div className="flex items-center py-2 px-4">
              <div className="w-12 text-xs font-medium text-gray-500 uppercase">
                BE
              </div>
              <span className="text-sm text-gray-500">
                No players on bench
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}