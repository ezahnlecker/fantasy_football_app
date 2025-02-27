import type { Player } from '../types';

export interface ESPNTeam {
  id: number;
  name: string;
  abbrev: string;
}

const API_BASE = 'http://localhost:3001/api';

interface ESPNConfig {
  leagueId: string;
  seasonId: string;
  swid?: string;
  espnS2?: string;
}

function getCurrentWeek(): number {
  const now = new Date();
  const seasonStart = new Date('2024-09-05');
  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  const weeksPassed = Math.floor((now.getTime() - seasonStart.getTime()) / msPerWeek);
  return Math.min(Math.max(1, weeksPassed + 1), 18);
}

class ESPNService {
  private config: ESPNConfig;

  constructor(config: ESPNConfig) {
    this.config = config;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/espn/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.config)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid credentials');
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Validation error:', error);
      throw error;
    }
  }

  async getLeagueTeams(): Promise<ESPNTeam[]> {
    const params = new URLSearchParams({
      leagueId: this.config.leagueId,
      seasonId: this.config.seasonId,
      ...(this.config.swid && { swid: this.config.swid }),
      ...(this.config.espnS2 && { espnS2: this.config.espnS2 })
    });

    const response = await fetch(`${API_BASE}/espn/teams?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    return response.json();
  }

  async getTeamRoster(teamId: number, week?: number): Promise<Player[]> {
    console.log('Fetching roster for team:', teamId, 'week:', week, 'with config:', this.config);
    
    const params = new URLSearchParams({
      leagueId: this.config.leagueId,
      seasonId: this.config.seasonId,
      ...(this.config.swid && { swid: this.config.swid }),
      ...(this.config.espnS2 && { espnS2: this.config.espnS2 }),
      week: String(week || getCurrentWeek())
    });

    const url = `${API_BASE}/espn/roster/${teamId}?${params}`;
    console.log('Request URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Roster fetch failed:', errorData);
      throw new Error('Failed to fetch roster');
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error('Invalid roster data:', data);
      throw new Error('Invalid roster data received');
    }
    
    return data;
  }
}

export const createESPNService = (config: ESPNConfig) => new ESPNService(config);