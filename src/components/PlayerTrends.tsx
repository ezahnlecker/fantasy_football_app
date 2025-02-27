import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Filter, RefreshCw } from 'lucide-react';
import { useESPN } from '../context/ESPNContext';

interface TrendingPlayer {
  id: string;
  name: string;
  team: string;
  position: string;
  totalPoints: number;
  lastGamePoints: number;
  photoUrl: string;
  isRostered: boolean;
}

interface TrendingData {
  trendingUp: TrendingPlayer[];
  trendingDown: TrendingPlayer[];
}

export default function PlayerTrends() {
  const { isConnected, espnConfig } = useESPN();
  const [trends, setTrends] = useState<TrendingData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchTrends = async () => {
      if (!isConnected || !espnConfig) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/players/trending?leagueId=${espnConfig.leagueId}&seasonId=${espnConfig.seasonId}&position=${selectedPosition}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending players');
        }
        
        const data = await response.json();
        setTrends(data);
      } catch (error) {
        console.error('Failed to fetch trends:', error);
        setError('Failed to load trending players. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      fetchTrends();
    }
  }, [isConnected, espnConfig, selectedPosition]);

  const handleRefresh = async () => {
    if (!isConnected || !espnConfig || refreshing) return;
    
    setRefreshing(true);
    try {
      // Trigger a data update
      const updateResponse = await fetch('/api/players/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leagueId: espnConfig.leagueId,
          seasonId: espnConfig.seasonId,
          swid: espnConfig.swid,
          espnS2: espnConfig.espnS2
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update player data');
      }
      
      // Fetch updated trends
      const trendsResponse = await fetch(
        `/api/players/trending?leagueId=${espnConfig.leagueId}&seasonId=${espnConfig.seasonId}&position=${selectedPosition}`
      );
      
      if (!trendsResponse.ok) {
        throw new Error('Failed to fetch updated trends');
      }
      
      const data = await trendsResponse.json();
      setTrends(data);
      
    } catch (error) {
      console.error('Refresh failed:', error);
      setError('Failed to refresh data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Player Trends</h2>
        </div>
        <div className="p-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Connect your ESPN account to view trending players</p>
          <p className="text-sm text-gray-400">
            See which players are heating up or cooling down based on recent performance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="w-6 h-6 text-indigo-600 mr-2" />
          Player Trends
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="ALL">All Positions</option>
            <option value="QB">QB</option>
            <option value="RB">RB</option>
            <option value="WR">WR</option>
            <option value="TE">TE</option>
            <option value="DST">DST</option>
          </select>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : 'text-gray-500'}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading trending players...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="flex items-center text-green-600 font-medium mb-4">
              <ArrowUp className="w-4 h-4 mr-2" />
              Trending Up
            </h3>
            <div className="space-y-2">
              {trends?.trendingUp && trends.trendingUp.length > 0 ? (
                trends.trendingUp.map((player) => (
                  <div key={player.id} className="p-3 border rounded-lg hover:border-green-300 transition-colors">
                    <div className="flex items-center">
                      <img 
                        src={player.photoUrl} 
                        alt={player.name}
                        className="w-10 h-10 rounded-full mr-3"
                        onError={(e) => {
                          e.currentTarget.src = '/default-player.png';
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-500">
                              {player.team} • {player.position}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-600 font-medium">
                              {player.lastGamePoints.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {player.isRostered ? "Rostered" : "Free Agent"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 border border-dashed rounded-lg text-center text-gray-500">
                  No trending up players found
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="flex items-center text-red-600 font-medium mb-4">
              <ArrowDown className="w-4 h-4 mr-2" />
              Trending Down
            </h3>
            <div className="space-y-2">
              {trends?.trendingDown && trends.trendingDown.length > 0 ? (
                trends.trendingDown.map((player) => (
                  <div key={player.id} className="p-3 border rounded-lg hover:border-red-300 transition-colors">
                    <div className="flex items-center">
                      <img 
                        src={player.photoUrl} 
                        alt={player.name}
                        className="w-10 h-10 rounded-full mr-3"
                        onError={(e) => {
                          e.currentTarget.src = '/default-player.png';
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-500">
                              {player.team} • {player.position}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-red-600 font-medium">
                              {player.lastGamePoints.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {player.isRostered ? "Rostered" : "Free Agent"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 border border-dashed rounded-lg text-center text-gray-500">
                  No trending down players found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Weekly Trend Analysis</h3>
        <p className="text-gray-500 text-sm">
          Players trending up have scored the most points in their most recent game, while players trending down have underperformed expectations.
          Consider adding trending up players to your watchlist and evaluating trending down players on your roster.
        </p>
      </div>
    </div>
  );
} 