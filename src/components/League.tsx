import React, { useEffect } from 'react';
import { Trophy, Users, Star, TrendingUp, Shield } from 'lucide-react';
import { useESPN } from '../context/ESPNContext';
import PlayerCard from './PlayerCard';

interface TeamStats {
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  standing: number;
}

const League = () => {
  const { isConnected, teams, isLoading } = useESPN();

  useEffect(() => {
    console.log('Teams data:', teams);
  }, [teams]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">League Overview</h2>
        </div>
        <div className="text-sm text-gray-500">2024 Season</div>
      </div>

      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            Connect your ESPN account in Settings to view league information and team details.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* League Standings */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W-L</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PF</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PA</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STRK</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isConnected ? (
                teams?.map((team, index) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {team.rank || index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        {team.logo ? (
                          <img src={team.logo} alt="" className="h-8 w-8 rounded-full" />
                        ) : (
                          <Shield className="h-8 w-8 text-gray-400" />
                        )}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">{team.name}</div>
                          <div className="text-xs text-gray-500">Manager Name</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm ${
                      team.wins > team.losses ? 'text-green-600' : 
                      team.wins < team.losses ? 'text-red-600' : 
                      'text-gray-500'
                    }`}>
                      {team.record}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {team.pointsFor.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {team.pointsAgainst.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {team.winStreak > 0 ? (
                        <span className="text-green-600">W{team.winStreak} 🔥</span>
                      ) : team.winStreak < 0 ? (
                        <span className="text-red-600">L{Math.abs(team.winStreak)} ❄️</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Connect your ESPN account to view standings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* League Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-700">Highest Scoring Team</h3>
            </div>
            {isConnected ? (
              <div className="text-gray-600">Loading stats...</div>
            ) : (
              <div className="text-gray-500 text-sm">Connect to view stats</div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-700">Most Improved</h3>
            </div>
            {isConnected ? (
              <div className="text-gray-600">Loading stats...</div>
            ) : (
              <div className="text-gray-500 text-sm">Connect to view stats</div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-700">League Activity</h3>
            </div>
            {isConnected ? (
              <div className="text-gray-600">Loading activity...</div>
            ) : (
              <div className="text-gray-500 text-sm">Connect to view activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default League;