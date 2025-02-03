import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { createESPNService } from '../services/espnApi';
import { useESPN } from '../context/ESPNContext';

export default function Settings() {
  const { isConnected, connect, disconnect, error } = useESPN();
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [espnCredentials, setEspnCredentials] = useState({
    leagueId: '',
    seasonId: new Date().getFullYear().toString(),
    swid: '',
    espnS2: ''
  });

  // Check server health on component mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const service = createESPNService({ leagueId: '', seasonId: '' });
        const isHealthy = await service.checkHealth();
        setServerStatus(isHealthy ? 'online' : 'offline');
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServerHealth();
    
    // Load saved credentials
    const savedCredentials = localStorage.getItem('espn_credentials');
    if (savedCredentials) {
      setEspnCredentials(JSON.parse(savedCredentials));
    }
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    // Save credentials before connecting
    localStorage.setItem('espn_credentials', JSON.stringify(espnCredentials));
    connect(
      espnCredentials.leagueId,
      espnCredentials.seasonId,
      espnCredentials.swid,
      espnCredentials.espnS2
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Server Status:</span>
          {serverStatus === 'checking' ? (
            <span className="text-yellow-600">Checking...</span>
          ) : serverStatus === 'online' ? (
            <span className="text-green-600 flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Online</span>
            </span>
          ) : (
            <span className="text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Offline</span>
            </span>
          )}
        </div>
      </div>

      {serverStatus === 'offline' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium">Server Connection Error</h4>
            <p className="text-sm mt-1">Unable to connect to the backend server. Please try again later.</p>
          </div>
        </div>
      )}

      <div className="border-b pb-4">
        <h3 className="font-semibold text-gray-700 flex items-center space-x-2 mb-4">
          <Shield className="w-4 h-4" />
          <span>ESPN Account</span>
          {isConnected && (
            <span className="flex items-center space-x-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Connected</span>
            </span>
          )}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
            <XCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {isConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Your ESPN Fantasy Football account is connected.</p>
            <button
              onClick={disconnect}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Disconnect Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                League ID
              </label>
              <input
                type="text"
                value={espnCredentials.leagueId}
                onChange={(e) => setEspnCredentials(prev => ({ ...prev, leagueId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Season ID
              </label>
              <input
                type="text"
                value={espnCredentials.seasonId}
                onChange={(e) => setEspnCredentials(prev => ({ ...prev, seasonId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SWID
              </label>
              <input
                type="text"
                value={espnCredentials.swid}
                onChange={(e) => setEspnCredentials(prev => ({ ...prev, swid: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ESPN_S2
              </label>
              <input
                type="text"
                value={espnCredentials.espnS2}
                onChange={(e) => setEspnCredentials(prev => ({ ...prev, espnS2: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Connect Account
            </button>
          </form>
        )}
      </div>

      <div className="border-b pb-4 pt-4">
        <h3 className="font-semibold text-gray-700 flex items-center space-x-2 mb-4">
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded text-indigo-600" />
            <span>Lineup reminders</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded text-indigo-600" />
            <span>Trade proposals</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded text-indigo-600" />
            <span>Player updates</span>
          </label>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="font-semibold text-gray-700 flex items-center space-x-2 mb-4">
          <Database className="w-4 h-4" />
          <span>Data Preferences</span>
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded text-indigo-600" />
            <span>Use historical data for predictions</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded text-indigo-600" />
            <span>Include weather data in analysis</span>
          </label>
        </div>
      </div>
    </div>
  );
}