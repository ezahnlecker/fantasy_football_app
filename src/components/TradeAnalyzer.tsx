import React, { useState } from 'react';
import { ArrowRightLeft, Wand2 } from 'lucide-react';
import PlayerSearchPanel from './PlayerSearchPanel';
import type { Player } from '../types';

export default function TradeAnalyzer() {
  const [givingPlayers, setGivingPlayers] = useState<Player[]>([]);
  const [receivingPlayers, setReceivingPlayers] = useState<Player[]>([]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Trade Analyzer</h2>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <Wand2 className="w-4 h-4" />
          <span>Suggest Trade</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PlayerSearchPanel 
          title="Players You Give"
          selectedPlayers={givingPlayers}
          onPlayersChange={setGivingPlayers}
        />
        
        <PlayerSearchPanel 
          title="Players You Receive"
          selectedPlayers={receivingPlayers}
          onPlayersChange={setReceivingPlayers}
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Trade Analysis</h3>
        {givingPlayers.length > 0 && receivingPlayers.length > 0 ? (
          <div className="space-y-2">
            <p>Analysis will appear here...</p>
          </div>
        ) : (
          <p className="text-gray-500">Select players on both sides to analyze the trade</p>
        )}
      </div>
    </div>
  );
}