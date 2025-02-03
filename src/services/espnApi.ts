import type { Player } from '../types';

export interface ESPNTeam {
  id: number;
  name: string;
  abbrev: string;
}

const API_BASE = '/api/espn';

interface ESPNConfig {
  leagueId: string;
  seasonId: string;
  swid?: string;
  espnS2?: string;
}

class ESPNService {
  private config: ESPNConfig;

  constructor(config: ESPNConfig) {
    this.config = config;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health');
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
      const response = await fetch(`${API_BASE}/validate`, {
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

    const response = await fetch(`${API_BASE}/teams?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    return response.json();
  }

  async getTeamRoster(teamId: number): Promise<Player[]> {
    const params = new URLSearchParams({
      leagueId: this.config.leagueId,
      seasonId: this.config.seasonId,
      ...(this.config.swid && { swid: this.config.swid }),
      ...(this.config.espnS2 && { espnS2: this.config.espnS2 })
    });

    const response = await fetch(`${API_BASE}/roster/${teamId}?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch roster');
    }
    return response.json();
  }
}

export const createESPNService = (config: ESPNConfig) => new ESPNService(config);