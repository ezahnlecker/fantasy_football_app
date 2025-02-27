import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const execPromise = promisify(exec);

const ESPN_API_BASE = 'https://fantasy.espn.com/apis/v3/games/ffl';

// Add headers for ESPN API requests
const getHeaders = (cookies) => {
    const headers = {};
    if (cookies?.swid && cookies?.espnS2) {
        headers.Cookie = `SWID=${cookies.swid}; espn_s2=${cookies.espnS2}`;
    }
    return headers;
};

// Make authenticated requests to ESPN API
const espnRequest = async (url, cookies) => {
    try {
        const response = await axios.get(url, {
            headers: getHeaders(cookies)
        });
        return response.data;
    } catch (error) {
        console.error('ESPN API Error:', error.response?.data || error.message);
        throw error;
    }
};

class ESPNService {
    constructor() {
        this.leagueId = process.env.ESPN_LEAGUE_ID;
        this.season = process.env.ESPN_SEASON;
        this.espn_s2 = process.env.ESPN_S2;
        this.swid = process.env.SWID;
    }

    createPythonScript(command) {
        return `
from espn_api.football import League
import json

try:
    league = League(
        league_id="${this.leagueId}",
        year=${this.season},
        espn_s2="${this.espn_s2}",
        swid="{${this.swid}}"
    )
    ${command}
except Exception as e:
    import traceback
    print(json.dumps({
        "error": str(e),
        "traceback": traceback.format_exc()
    }))
`;
    }

    async getTeams() {
        try {
            const pythonCommand = `
    teams = []
    for team in league.teams:
        teams.append({
            "id": team.team_id,
            "name": team.team_name,
            "rank": team.standing,
            "record": f"{team.wins}-{team.losses}",
            "pointsFor": team.points_for,
            "pointsAgainst": team.points_against,
            "winStreak": team.streak_length if hasattr(team, "streak_length") else 0
        })
    print(json.dumps(teams))`;

            const pythonScript = this.createPythonScript(pythonCommand);
            console.log('Executing Python script with config:', {
                leagueId: this.leagueId,
                season: this.season,
                hasEspnS2: !!this.espn_s2,
                hasSwid: !!this.swid
            });
            
            const { stdout, stderr } = await execPromise('python3 -c "' + pythonScript.replace(/"/g, '\\"') + '"');
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }

            const result = JSON.parse(stdout);
            if (result.error) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error('Error fetching teams:', error);
            throw error;
        }
    }

    async getTeamRoster(teamId) {
        try {
            const pythonCommand = `
    team = next((team for team in league.teams if team.team_id == ${teamId}), None)
    if team:
        roster = []
        for player in team.roster:
            roster.append({
                "id": player.playerId,
                "name": player.name,
                "position": player.position,
                "injuryStatus": player.injuryStatus if hasattr(player, "injuryStatus") else None,
                "status": "active",
                "lineupSlot": player.lineupSlot if hasattr(player, "lineupSlot") else None,
                "isBenched": player.lineupSlot == 20 if hasattr(player, "lineupSlot") else None
            })
        print(json.dumps(roster))
    else:
        print(json.dumps({"error": "Team not found"}))`;

            const pythonScript = this.createPythonScript(pythonCommand);
            console.log('Fetching roster for team:', teamId);
            
            const { stdout, stderr } = await execPromise('python3 -c "' + pythonScript.replace(/"/g, '\\"') + '"');
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }

            const result = JSON.parse(stdout);
            if (result.error) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error('Error fetching roster:', error);
            throw error;
        }
    }

    async getTopPlayersByPosition(position, limit = 100) {
        try {
            const pythonCommand = `
    players = []
    # Get players from all teams
    for team in league.teams:
        for player in team.roster:
            if player.position == "${position}":
                players.append({
                    "id": player.playerId,
                    "name": player.name,
                    "position": player.position,
                    "team": team.team_name,
                    "weeklyStats": {
                        "points": player.total_points if hasattr(player, "total_points") else 0,
                        "projected_points": player.projected_total_points if hasattr(player, "projected_total_points") else 0
                    }
                })
    
    # Get free agents too
    for player in league.free_agents():
        if player.position == "${position}":
            players.append({
                "id": player.playerId,
                "name": player.name,
                "position": player.position,
                "team": "Free Agent",
                "weeklyStats": {
                    "points": player.total_points if hasattr(player, "total_points") else 0,
                    "projected_points": player.projected_total_points if hasattr(player, "projected_total_points") else 0
                }
            })
    
    # Sort players by total points in descending order
    sorted_players = sorted(players, key=lambda x: x["weeklyStats"]["points"], reverse=True)
    print(json.dumps(sorted_players[:${limit}]))`;

            const pythonScript = this.createPythonScript(pythonCommand);
            console.log('Fetching top players for position:', position);
            
            const { stdout, stderr } = await execPromise('python3 -c "' + pythonScript.replace(/"/g, '\\"') + '"');
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }

            const result = JSON.parse(stdout);
            if (result.error) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error('Error fetching top players:', error);
            throw error;
        }
    }

    async debugLeagueMethods() {
        try {
            const pythonCommand = `
    # Get available methods and attributes
    methods = {
        "league_methods": [method for method in dir(league) if not method.startswith('_')],
        "sample_team_methods": [method for method in dir(league.teams[0]) if not method.startswith('_')],
        "sample_player_methods": [method for method in dir(league.teams[0].roster[0]) if not method.startswith('_')]
    }
    print(json.dumps(methods))`;

            const pythonScript = this.createPythonScript(pythonCommand);
            const { stdout, stderr } = await execPromise('python3 -c "' + pythonScript.replace(/"/g, '\\"') + '"');
            
            if (stderr) {
                console.error('Python stderr:', stderr);
            }

            return JSON.parse(stdout);
        } catch (error) {
            console.error('Error debugging league methods:', error);
            throw error;
        }
    }
}

export default new ESPNService(); 