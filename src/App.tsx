import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ESPNProvider } from './context/ESPNContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LineupOptimizer from './components/LineupOptimizer';
import TradeAnalyzer from './components/TradeAnalyzer';
import TrendingPlayers from './components/HotPlayers';
import Settings from './components/Settings';
import League from './components/League';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <ESPNProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                  <Routes>
                    <Route path="/" element={<League />} />
                    <Route path="/league" element={<League />} />
                    <Route path="/lineup" element={<LineupOptimizer />} />
                    <Route path="/trending" element={<TrendingPlayers />} />
                    <Route path="/trades" element={<TradeAnalyzer />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </Router>
      </ESPNProvider>
    </ErrorBoundary>
  );
};

export default App;