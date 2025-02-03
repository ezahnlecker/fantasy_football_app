import React, { createContext, useContext, useState, useEffect } from 'react';
import { createESPNService, type ESPNTeam } from '../services/espnApi';
import type { Player } from '../types';

interface ESPNContextType {
  isConnected: boolean;
  connect: (leagueId: string, seasonId: string, swid?: string, espnS2?: string) => Promise<void>;
  disconnect: () => void;
  roster: Player[];
  teams: ESPNTeam[];
  selectedTeamId: number | null;
  selectTeam: (teamId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshRoster: () => Promise<void>;
}

const ESPNContext = createContext<ESPNContextType | null>(null);

export function ESPNProvider({ children }: { children: React.ReactNode }) {
  const [espnService, setEspnService] = useState<ReturnType<typeof createESPNService> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roster, setRoster] = useState<Player[]>([]);
  const [teams, setTeams] = useState<ESPNTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async (leagueId: string, seasonId: string, swid?: string, espnS2?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const service = createESPNService({ leagueId, seasonId, swid, espnS2 });
      
      // Validate connection by fetching teams
      const isValid = await service.validateConnection();
      if (!isValid) {
        throw new Error('Unable to connect to ESPN. Please check your credentials.');
      }

      // Fetch teams after successful connection
      const leagueTeams = await service.getLeagueTeams();
      
      setEspnService(service);
      setTeams(leagueTeams);
      setIsConnected(true);
      
      // Save valid configuration
      localStorage.setItem('espn_config', JSON.stringify({ leagueId, seasonId, swid, espnS2 }));
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Failed to connect to ESPN');
      localStorage.removeItem('espn_config');
    } finally {
      setIsLoading(false);
    }
  };

  const selectTeam = async (teamId: number) => {
    if (!espnService) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const rosterData = await espnService.getTeamRoster(teamId);
      setRoster(rosterData);
      setSelectedTeamId(teamId);
      localStorage.setItem('selected_team_id', teamId.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roster');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setEspnService(null);
    setIsConnected(false);
    setRoster([]);
    setTeams([]);
    setSelectedTeamId(null);
    setError(null);
    localStorage.removeItem('espn_config');
    localStorage.removeItem('selected_team_id');
  };

  const refreshRoster = async () => {
    if (!espnService || !selectedTeamId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const rosterData = await espnService.getTeamRoster(selectedTeamId);
      setRoster(rosterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roster');
    } finally {
      setIsLoading(false);
    }
  };

  // Restore connection on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('espn_config');
    const savedTeamId = localStorage.getItem('selected_team_id');
    
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      connect(config.leagueId, config.seasonId, config.swid, config.espnS2)
        .then(() => {
          if (savedTeamId) {
            selectTeam(parseInt(savedTeamId, 10));
          }
        });
    }
  }, []);

  return (
    <ESPNContext.Provider 
      value={{ 
        isConnected, 
        connect, 
        disconnect, 
        roster, 
        teams,
        selectedTeamId,
        selectTeam,
        isLoading, 
        error,
        refreshRoster 
      }}
    >
      {children}
    </ESPNContext.Provider>
  );
}

export const useESPN = () => {
  const context = useContext(ESPNContext);
  if (!context) {
    throw new Error('useESPN must be used within an ESPNProvider');
  }
  return context;
};