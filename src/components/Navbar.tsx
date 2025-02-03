import React from 'react';
import { Trophy } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8" />
            <span className="font-bold text-xl">FantasyAI Pro</span>
          </div>
        </div>
      </div>
    </nav>
  );
}