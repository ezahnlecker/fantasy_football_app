import React from 'react';
import { Shield, TrendingUp, TrendingDown } from 'lucide-react';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  showTrend?: boolean;
  showOpponent?: boolean;
}

export default function PlayerCard({ player, showTrend, showOpponent }: PlayerCardProps) {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
          <img 
            src={player.photoUrl} 
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">{player.position}</span>
            <span className="font-medium">{player.name}</span>
          </div>
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            <span>{player.team}</span>
            {showOpponent && (
              <>
                <span>vs</span>
                <span className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>{player.opponent}</span>
                  <span className={`text-xs font-medium ${
                    player.opponentRank <= 10 ? 'text-red-500' : 
                    player.opponentRank <= 20 ? 'text-yellow-500' : 
                    'text-green-500'
                  }`}>
                    (#{player.opponentRank})
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-indigo-600">{player.projectedPoints}</div>
        <div className="text-sm text-gray-500">Projected</div>
        {showTrend && (
          <div className={`flex items-center space-x-1 ${
            player.trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {player.trend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-semibold">{player.trend > 0 ? '+' : ''}{player.trend}%</span>
          </div>
        )}
      </div>
    </div>
  );
}