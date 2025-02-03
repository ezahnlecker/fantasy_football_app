import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = 3001;

app.use(cors());
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

// Validate ESPN connection
app.post('/api/espn/validate', async (req, res) => {
  try {
    const { leagueId, seasonId, swid, espnS2 } = req.body;
    const url = `${ESPN_API_BASE}/seasons/${seasonId}/segments/0/leagues/${leagueId}`;
    await espnRequest(url, swid && espnS2 ? { swid, espnS2 } : null);
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ 
      valid: false, 
      error: 'Invalid ESPN credentials or league access denied' 
    });
  }
});

// Get league teams
app.get('/api/espn/teams', async (req, res) => {
  try {
    const { leagueId, seasonId, swid, espnS2 } = req.query;
    const url = `${ESPN_API_BASE}/seasons/${seasonId}/segments/0/leagues/${leagueId}/teams`;
    const data = await espnRequest(url, swid && espnS2 ? { swid, espnS2 } : null);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get team roster
app.get('/api/espn/roster/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { leagueId, seasonId, swid, espnS2 } = req.query;
    const url = `${ESPN_API_BASE}/seasons/${seasonId}/segments/0/leagues/${leagueId}/teams/${teamId}/roster`;
    const data = await espnRequest(url, swid && espnS2 ? { swid, espnS2 } : null);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roster' });
  }
});

app.listen(port, () => {
  console.log(`ESPN API proxy server running on port ${port}`);
});