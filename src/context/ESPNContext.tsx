import React, { createContext, useContext, useState, useEffect } from 'react';
import { createESPNService, type ESPNTeam } from '../services/espnApi';
import type { Player } from '../types';

interface ESPNConfig {
  leagueId: string;
  seasonId: string;
  swid?: string;
  espnS2?: string;
}

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
  selectedWeek: number;
  setSelectedWeek: React.Dispatch<React.SetStateAction<number>>;
  getRoster: (teamId: number, week: number) => Promise<Player[]>;
  espnConfig: ESPNConfig | null;
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
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    // Default to current week
    const now = new Date();
    const seasonStart = new Date('2024-09-05');
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const weeksPassed = Math.floor((now.getTime() - seasonStart.getTime()) / msPerWeek);
    return Math.min(Math.max(1, weeksPassed + 1), 18);
  });
  const [espnConfig, setEspnConfig] = useState<ESPNConfig | null>(null);

  useEffect(() => {
    const savedTeamId = localStorage.getItem('selected_team_id');
    if (savedTeamId) {
      setSelectedTeamId(Number(savedTeamId));
    }
  }, []);

  const connect = async (leagueId: string, seasonId: string, swid?: string, espnS2?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
        const service = createESPNService({ leagueId, seasonId, swid, espnS2 });
        
        // Validate connection by fetching teams
        await service.validateConnection();
        
        // Fetch teams after successful connection
        const leagueTeams = await service.getLeagueTeams();
        
        // Set service first
        setEspnService(service);
        
        setTeams(leagueTeams);
        setIsConnected(true);
        
        // Save valid configuration
        localStorage.setItem('espn_config', JSON.stringify({ leagueId, seasonId, swid, espnS2 }));
        
        setEspnConfig({
          leagueId,
          seasonId,
          swid,
          espnS2
        });
    } catch (err) {
        console.error('Connect error:', err);
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Failed to connect to ESPN');
        localStorage.removeItem('espn_config');
        throw err;
    } finally {
        setIsLoading(false);
    }
  };

  const selectTeam = async (teamId: number) => {
    if (!espnService) {
        console.error('No ESPN service available');
        setError('Not connected to ESPN');
        return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
        const rosterData = await espnService.getTeamRoster(teamId, selectedWeek);
        setRoster(rosterData);
        setSelectedTeamId(teamId);
        localStorage.setItem('selected_team_id', teamId.toString());
    } catch (err) {
        console.error('Team selection failed:', err);
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
    setEspnConfig(null);
  };

  const refreshRoster = async () => {
    if (!espnService || !selectedTeamId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Refreshing roster for week:', selectedWeek);
      const rosterData = await espnService.getTeamRoster(selectedTeamId, selectedWeek);
      if (!Array.isArray(rosterData)) {
        throw new Error('Invalid roster data received');
      }
      setRoster(rosterData);
    } catch (err) {
      console.error('Roster refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roster');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoster = async (teamId: number, week: number) => {
    if (!espnService) throw new Error('Not connected to ESPN');
    return await espnService.getTeamRoster(teamId, week);
  };

  // Restore connection on mount
  useEffect(() => {
    let mounted = true;

    const initializeESPN = async () => {
        const savedConfig = localStorage.getItem('espn_config');
        if (!savedConfig) return;

        try {
            const config = JSON.parse(savedConfig);
            const service = createESPNService(config);
            
            // Set service first
            setEspnService(service);
            
            // Then validate and set connected state
            await service.validateConnection();
            if (!mounted) return;
            
            setIsConnected(true);

            // Then fetch teams
            const leagueTeams = await service.getLeagueTeams();
            if (!mounted) return;
            setTeams(leagueTeams);

            // Finally load saved team if any
            const savedTeamId = localStorage.getItem('selected_team_id');
            if (savedTeamId && mounted) {
                const teamId = parseInt(savedTeamId, 10);
                setSelectedTeamId(teamId);
                // Fetch initial roster
                const rosterData = await service.getTeamRoster(teamId, selectedWeek);
                if (mounted) {
                    setRoster(rosterData);
                }
            }
            
            setEspnConfig(config);
        } catch (error) {
            console.error('Failed to initialize ESPN connection:', error);
            if (!mounted) return;
            setIsConnected(false);
            setEspnService(null);
            setError('Failed to connect to ESPN. Please reconnect in Settings.');
            localStorage.removeItem('espn_config');
            localStorage.removeItem('selected_team_id');
        }
    };

    initializeESPN();
    return () => { mounted = false; };
  }, []); // Empty dependency array since we only want this on mount

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
        refreshRoster,
        selectedWeek,
        setSelectedWeek,
        getRoster,
        espnConfig
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