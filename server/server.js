import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import sequelize from './config/database.js';
import * as models from './models/index.js';
import { execPromise } from './utils/execPromise.js';
import Roster from './models/roster.js';
import { getCurrentWeek } from './utils/dateUtils.js';
import cron from 'node-cron';
import { updatePlayerData } from './jobs/collectPlayerData.js';
import playerRoutes from './routes/api/players.js';

// Import routes
import usersRouter from './routes/api/users.js';
import teamsRouter from './routes/api/teams.js';
import leaguesRouter from './routes/api/leagues.js';
import tradesRouter from './routes/api/trades.js';

dotenv.config();
const app = express();
const port = 3001;

// Basic middleware
app.use(cors({
    origin: 'http://localhost:5173'  // Update to match Vite's port
}));
app.use(express.json());

const ESPN_API_BASE = 'https://fantasy.espn.com/apis/v3/games/ffl';

// Helper to make authenticated requests to ESPN API
async function espnRequest(url, cookies) {
    try {
        const response = await axios.get(url, {
            headers: cookies ? {
                Cookie: `SWID=${cookies.swid}; espn_s2=${cookies.espnS2}`
            } : {}
        });
        return response.data;
    } catch (error) {
        console.error('ESPN API Error:', error.response?.data || error.message);
        throw error;
    }
}

// Initialize database
async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sync all models
        await sequelize.sync({ alter: true });
        console.log('Database models synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// ESPN Direct API Routes
app.post('/api/espn/validate', async (req, res) => {
    try {
        const { leagueId, seasonId, swid, espnS2 } = req.body;
        const pythonScript = `
from espn_api.football import League
import json

try:
    league = League(
        league_id="${leagueId}",
        year=${seasonId},
        espn_s2="${espnS2}",
        swid="{${swid}}"
    )
    print(json.dumps({"valid": True}))
except Exception as e:
    print(json.dumps({
        "valid": False,
        "error": str(e)
    }))
`;
        const { stdout } = await execPromise('python3 -c "' + pythonScript.replace(/"/g, '\\"') + '"');
        const result = JSON.parse(stdout);
        
        if (!result.valid) {
            res.status(401).json(result);
        } else {
            res.json(result);
        }
    } catch (error) {
        res.status(500).json({ 
            valid: false, 
            error: 'Failed to validate credentials' 
        });
    }
});

app.get('/api/espn/teams', async (req, res) => {
    try {
        const { leagueId, seasonId, swid, espnS2 } = req.query;
        const pythonScript = `
from espn_api.football import League
import json

try:
    league = League(
        league_id="${leagueId}",
        year=${seasonId},
        espn_s2="${espnS2}",
        swid="{${swid}}"
    )
    teams = [{
        "id": team.team_id,
        "name": team.team_name,
        "abbrev": team.team_abbrev,
        "record": f"{team.wins}-{team.losses}",
        "pointsFor": float(team.points_for),
        "pointsAgainst": float(team.points_against),
        "winStreak": team.streak_length if hasattr(team, "streak_length") else 0,
        "rank": team.standing,
        "logo": team.logo_url if hasattr(team, "logo_url") else None,
        "wins": team.wins,
        "losses": team.losses
    } for team in league.teams]
    
    # Sort teams by rank
    teams.sort(key=lambda x: x["rank"] if x["rank"] is not None else 999)
    
    print(json.dumps(teams))
except Exception as e:
    print(json.dumps({
        "error": str(e)
    }))
`;
        const { stdout } = await execPromise('python3 -c "' + pythonScript.replace(/"/g, '\\"') + '"');
        const result = JSON.parse(stdout);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

app.get('/api/espn/roster/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { leagueId, seasonId, swid, espnS2, week = getCurrentWeek() } = req.query;

        console.log('Roster request:', { 
            teamId, 
            leagueId, 
            seasonId, 
            week,
            requestedWeek: week 
        });

        // Try to get from database first
        const savedRoster = await Roster.findOne({
            where: {
                teamId: Number(teamId),
                leagueId,
                week: Number(week),
                seasonId
            }
        });

        // For past weeks, return cached data
        const currentWeek = getCurrentWeek();
        if (savedRoster && Number(week) < currentWeek) {
            return res.json(savedRoster.rosterData);
        }

        // If not in DB or current week, fetch from ESPN
        const pythonScript = `
from espn_api.football import League
from espn_api.football.constant import POSITION_MAP, PRO_TEAM_MAP
import json

try:
    # Build reverse mapping for NFL teams
    abbr_to_id = {abbr: str(team_id) for team_id, abbr in PRO_TEAM_MAP.items() if abbr}
    
    # Initialize league
    league = League(
        league_id="${leagueId}",
        year=${seasonId},
        espn_s2="${espnS2}",
        swid="{${swid}}"
    )
    
    # Get box scores and positional ratings
    box_scores = league.box_scores(week=${week})
    positional_ratings = league._get_positional_ratings(${week})
    
    # Find our team's box score
    team = next(t for t in league.teams if t.team_id == ${teamId})
    roster_box = next(box for box in box_scores 
                     if box.home_team.team_id == ${teamId} 
                     or box.away_team.team_id == ${teamId})
    
    # Get the correct lineup
    lineup = roster_box.home_lineup if roster_box.home_team.team_id == ${teamId} else roster_box.away_lineup
    
    # Process player data
    roster = []
    for player in lineup:
        # Handle opponent attribute differences between current and historical weeks
        opponent = None
        if hasattr(player, 'pro_opponent'):
            opponent = player.pro_opponent
        elif hasattr(player, 'opponent'):
            opponent = player.opponent

        # Get opponent rank if we have an opponent
        opponent_rank = None
        if opponent:
            pos_key = str(POSITION_MAP.get(player.position, ''))
            opp_id = abbr_to_id.get(opponent, '')
            if pos_key and opp_id:
                opponent_rank = positional_ratings.get(pos_key, {}).get(opp_id)

        player_data = {
            "id": player.playerId,
            "name": player.name,
            "position": player.position,
            "team": player.proTeam,
            "status": "Injured Reserve" if player.lineupSlot == 'IR' 
                     else "Bench" if player.lineupSlot == 'BE' 
                     else "Active",
            "opponent": opponent,
            "opponentRank": opponent_rank,
            "projectedPoints": player.projected_points if hasattr(player, "projected_points") else 0,
            "actualPoints": player.points if hasattr(player, "points") else 0,
            "injuryStatus": player.injuryStatus if hasattr(player, "injuryStatus") else None,
            "lineupSlot": player.lineupSlot if hasattr(player, "lineupSlot") else None,
            "photoUrl": f"https://a.espncdn.com/i/headshots/nfl/players/full/{player.playerId}.png",
            "week": ${week}
        }
        roster.append(player_data)
    
    print(json.dumps(roster))
except Exception as e:
    print(json.dumps({
        "error": str(e)
    }))
`;

        const { stdout, stderr } = await execPromise('python3 -c "' + pythonScript.replace(/"/g, '\\"') + '"');
        
        if (stderr) {
            console.error('Python stderr:', stderr);
        }

        const rosterData = JSON.parse(stdout);

        if (rosterData.error) {
            console.error('ESPN API Error:', rosterData.error);
            throw new Error(rosterData.error);
        }

        if (!Array.isArray(rosterData)) {
            console.error('Invalid roster data:', rosterData);
            throw new Error('Invalid roster data received');
        }

        // Save/update in database
        await Roster.upsert({
            teamId: Number(teamId),
            leagueId,
            week: Number(week),
            seasonId,
            rosterData
        });

        res.json(rosterData);
    } catch (error) {
        console.error('Roster fetch failed:', error);
        res.status(500).json({ 
            error: 'Failed to fetch roster',
            details: error.message 
        });
    }
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/players', playerRoutes);
app.use('/api/leagues', leaguesRouter);
app.use('/api/trades', tradesRouter);

// Add health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, async () => {
    await initDatabase();
    console.log(`Server running on port ${port}`);
    console.log('Available endpoints:');
    console.log('User API:');
    console.log(`  GET    /api/users/:userId`);
    console.log(`  POST   /api/users`);
    console.log(`  POST   /api/users/:userId/credentials`);
    console.log('League API:');
    console.log(`  GET    /api/leagues/user/:userId`);
    console.log(`  POST   /api/leagues`);
    console.log(`  PUT    /api/leagues/:leagueId/settings`);
    console.log('Team API:');
    console.log(`  GET    /api/teams`);
    console.log(`  GET    /api/teams/:teamId/roster`);
    console.log(`  POST   /api/teams/:teamId/sync`);
    console.log('Player API:');
    console.log(`  GET    /api/players/top/:position`);
    console.log(`  GET    /api/players/:playerId/stats`);
    console.log(`  POST   /api/players/:playerId/trending`);
    console.log('Trade API:');
    console.log(`  GET    /api/trades/league/:leagueId`);
    console.log(`  POST   /api/trades`);
    console.log(`  PUT    /api/trades/:tradeId/status`);
    console.log(`  PUT    /api/trades/:tradeId/analysis`);
    console.log('ESPN Direct API:');
    console.log(`  http://localhost:${port}/api/espn/validate`);
    console.log(`  http://localhost:${port}/api/espn/teams`);
    console.log(`  http://localhost:${port}/api/espn/roster/:teamId`);
});

// Run player data update every Tuesday at 4am (after all Monday night games)
cron.schedule('0 4 * * 2', async () => {
  console.log('Running weekly player data update...');
  
  try {
    // Get all active leagues from database
    const leagues = await League.findAll({
      attributes: ['espn_id', 'season']
    });
    
    // Update player data for each league
    for (const league of leagues) {
      await updatePlayerData(league.espn_id, league.season);
    }
    
    console.log('Weekly player data update completed');
  } catch (error) {
    console.error('Weekly player data update failed:', error);
  }
});

// Update the ESPN connection endpoint
app.post('/api/espn/connect', async (req, res) => {
  try {
    const { leagueId, seasonId, swid, espnS2 } = req.body;
    
    // Validate the connection
    try {
      // Your existing validation code
      
      // After successful validation, collect player data
      try {
        const { collectAllPlayers } = await import('./jobs/collectPlayerData.js');
        await collectAllPlayers(leagueId, seasonId, null, swid, espnS2);
        console.log('Player data collection initiated');
      } catch (playerError) {
        console.error('Player data collection failed:', playerError);
        // Don't fail the whole request if player collection fails
      }
      
      res.json({ success: true, message: 'Successfully connected to ESPN' });
    } catch (error) {
      console.error('ESPN connection validation failed:', error);
      res.status(400).json({ success: false, message: 'Failed to connect to ESPN' });
    }
  } catch (error) {
    console.error('ESPN connection error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}); 