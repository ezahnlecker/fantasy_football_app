import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import PlayerCard from './PlayerCard';
import { useESPN } from '../context/ESPNContext';

const TrendingPlayers = () => {
  const { isConnected } = useESPN();

  useEffect(() => {
    const fetchPlayers = async () => {
      if (isConnected) {
        try {
          const response = await fetch('http://localhost:3001/api/players/top/QB');
          const data = await response.json();
          console.log('Player data:', data);
        } catch (error) {
          console.error('Error fetching players:', error);
        }
      }
    };
    
    fetchPlayers();
  }, [isConnected]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Trending Players</h2>
        </div>
        <div className="text-sm text-gray-500">
          Last 7 days
        </div>
      </div>

      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            Connect your ESPN account in Settings to view trending players and get AI-powered insights.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-700">Trending Up</h3>
            </div>
            <span className="text-sm text-green-600 font-medium">High Potential</span>
          </div>
          <div className="space-y-3">
            {isConnected ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Loading trending players...</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Connect to view trending players</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowDown className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-700">Trending Down</h3>
            </div>
            <span className="text-sm text-red-600 font-medium">Consider Benching</span>
          </div>
          <div className="space-y-3">
            {isConnected ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <TrendingDown className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Loading trending players...</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <TrendingDown className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Connect to view trending players</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Trend Analysis</h3>
        <p className="text-gray-500 text-sm">
          {isConnected 
            ? "Loading player trends and analysis..."
            : "Connect your account to get AI-powered trend analysis and recommendations."}
        </p>
      </div>
    </div>
  );
};

export default TrendingPlayers;