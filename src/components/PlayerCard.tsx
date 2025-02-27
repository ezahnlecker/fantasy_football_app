import React from 'react';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  showOpponent?: boolean;
  slot?: string;
}

export default function PlayerCard({ player, showOpponent = false, slot }: PlayerCardProps) {
  return (
    <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50">
      {/* Slot and Player Info Section */}
      <div className="flex items-center space-x-3 flex-1">
        {slot && (
          <div className="w-12 text-xs font-medium text-gray-500 uppercase">
            {slot}
          </div>
        )}
        <img
          src={player.photoUrl}
          alt={player.name}
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            e.currentTarget.src = '/default-player.png';
          }}
        />
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{player.name}</span>
            {player.injuryStatus && player.injuryStatus !== "ACTIVE" && (
              <span className="text-xs text-red-600">Q</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {player.team} {player.position}
          </div>
        </div>
      </div>

      {/* Points Section */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="w-12 text-right">
          <span className="text-gray-600">{player.projectedPoints.toFixed(1)}</span>
        </div>
        <div className="w-12 text-right">
          <span className="font-medium">{player.actualPoints.toFixed(1)}</span>
        </div>
      </div>

      {/* Matchup Section */}
      {showOpponent && player.opponent && (
        <div className="w-24 flex justify-end text-sm">
          {/* Opponent Column - fixed width */}
          <div className="w-12 text-right text-gray-600">
            {player.opponent || '-'}
          </div>
          {/* Rank Column - fixed width */}
          <div className="w-12 text-right">
            <span className={`${
              player.opponentRank 
                ? player.opponentRank <= 10 
                  ? 'text-red-600'
                  : player.opponentRank >= 20 
                    ? 'text-green-600'
                    : 'text-gray-600'
                : 'text-gray-400'
            }`}>
              {player.opponentRank || '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}