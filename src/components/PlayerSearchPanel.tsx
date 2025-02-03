import React, { useState } from 'react';
import { Search } from 'lucide-react';
import PlayerCard from './PlayerCard';
import type { Player } from '../types';

const positions = ['All', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'DST'];

interface PlayerSearchPanelProps {
  title: string;
  selectedPlayers: Player[];
  onPlayersChange: (players: Player[]) => void;
}

export default function PlayerSearchPanel({ 
  title, 
  selectedPlayers, 
  onPlayersChange 
}: PlayerSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All');

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search players..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedPosition === pos
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
        {selectedPlayers.length > 0 ? (
          <div className="space-y-2">
            {selectedPlayers.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player}
                showTrend
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Search and select players to add to the trade
          </div>
        )}
      </div>
    </div>
  );
}