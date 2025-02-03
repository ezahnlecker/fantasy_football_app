import express from 'express';
import cors from 'cors';
import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure CORS - Allow all origins in development
app.use(cors());
app.use(express.json());

const ESPN_API_BASE = 'https://fantasy.espn.com/apis/v3/games/ffl';

async function espnRequest(url, cookies) {
  try {
    console.log('Making ESPN API request:', url);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      }
    };

    if (cookies?.swid && cookies?.espnS2) {
      config.headers.Cookie = `SWID=${cookies.swid}; espn_s2=${cookies.espnS2}`;
    }

    console.log('Request headers:', config.headers);
    
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error('ESPN API Error:', error.response?.data || error.message);
    throw error;
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/espn/validate', async (req, res) => {
  try {
    const { leagueId, seasonId, swid, espnS2 } = req.body;
    console.log('Validating ESPN credentials:', { leagueId, seasonId });
    
    const url = `${ESPN_API_BASE}/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mTeam`;
    const data = await espnRequest(url, { swid, espnS2 });
    res.json({ valid: true, data });
  } catch (error) {
    console.error('Validation Error:', error);
    res.status(401).json({ 
      valid: false, 
      error: 'Unable to connect to ESPN. Please verify your credentials.' 
    });
  }
});

app.get('/api/espn/teams', async (req, res) => {
  try {
    const { leagueId, seasonId, swid, espnS2 } = req.query;
    console.log('Fetching teams:', { leagueId, seasonId });
    
    const url = `${ESPN_API_BASE}/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mTeam`;
    const data = await espnRequest(url, { swid, espnS2 });
    
    const teams = data.teams.map(team => ({
      id: team.id,
      name: `${team.location} ${team.nickname}`.trim(),
      abbrev: team.abbrev,
      logo: team.logo
    }));
    
    res.json(teams);
  } catch (error) {
    console.error('Teams Error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.get('/api/espn/roster/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { leagueId, seasonId, swid, espnS2 } = req.query;
    console.log('Fetching roster:', { teamId, leagueId, seasonId });
    
    const url = `${ESPN_API_BASE}/seasons/${seasonId}/segments/0/leagues/${leagueId}/teams/${teamId}?view=mRoster`;
    const data = await espnRequest(url, { swid, espnS2 });
    
    const players = data.roster.entries.map(entry => ({
      id: entry.playerId,
      name: entry.playerPoolEntry.player.fullName,
      position: entry.playerPoolEntry.player.defaultPositionId,
      team: entry.playerPoolEntry.player.proTeamId,
      projectedPoints: entry.playerPoolEntry.player.stats?.[0]?.appliedTotal || 0,
      status: entry.playerPoolEntry.player.injuryStatus?.toLowerCase() || 'active',
      photoUrl: `https://a.espncdn.com/i/headshots/nfl/players/full/${entry.playerId}.png`
    }));

    res.json(players);
  } catch (error) {
    console.error('Roster Error:', error);
    res.status(500).json({ error: 'Failed to fetch roster' });
  }
});

// AI Endpoints
app.post('/api/ai/analyze-trade', async (req, res) => {
  try {
    const { givingPlayers, receivingPlayers } = req.body;

    const prompt = `Analyze this fantasy football trade:

Giving:
${givingPlayers.map(p => `- ${p.name} (${p.position}) - Projected: ${p.projectedPoints}`).join('\n')}

Receiving:
${receivingPlayers.map(p => `- ${p.name} (${p.position}) - Projected: ${p.projectedPoints}`).join('\n')}

Provide a detailed analysis including:
1. Value comparison
2. Positional impact
3. Schedule/matchup considerations
4. Risk assessment
5. Clear recommendation (Accept/Decline)

Format the response in JSON with these keys:
- analysis (string)
- recommendation (string: "ACCEPT" or "DECLINE")
- confidenceScore (number: 0-100)
- keyFactors (array of strings)`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    res.json(analysis);
  } catch (error) {
    console.error('Trade Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze trade' });
  }
});

app.post('/api/ai/optimize-lineup', async (req, res) => {
  try {
    const { availablePlayers, positions } = req.body;

    const prompt = `Optimize this fantasy football lineup:

Available Players:
${availablePlayers.map(p => 
  `- ${p.name} (${p.position}) - Projected: ${p.projectedPoints} - Status: ${p.status}`
).join('\n')}

Required Positions:
${Object.entries(positions).map(([pos, count]) => 
  `- ${pos}: ${count} starter(s)`
).join('\n')}

Provide optimal lineup considering:
1. Projected points
2. Matchups
3. Player health/status
4. Position requirements
5. Upside potential

Format the response in JSON with these keys:
- starters (array of player IDs)
- bench (array of player IDs)
- reasoning (string)
- projectedTotal (number)
- confidenceScore (number: 0-100)`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" }
    });

    const optimization = JSON.parse(completion.choices[0].message.content);
    res.json(optimization);
  } catch (error) {
    console.error('Lineup Optimization Error:', error);
    res.status(500).json({ error: 'Failed to optimize lineup' });
  }
});

app.listen(port, 'localhost', () => {
  console.log(`Server running on http://localhost:${port}`);
});