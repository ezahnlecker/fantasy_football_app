import express from 'express';
import { Team, Player, League } from '../../models/index.js';
import espnPythonService from '../../services/espnPythonService.js';

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
    try {
        // Get teams directly from ESPN
        const espnTeams = await espnPythonService.getTeams();
        console.log('ESPN Teams:', espnTeams);
        res.json(espnTeams);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch teams',
            details: error.message 
        });
    }
});

// Get team roster
router.get('/:teamId/roster', async (req, res) => {
    try {
        const roster = await espnPythonService.getTeamRoster(req.params.teamId);
        res.json(roster);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch roster',
            details: error.message 
        });
    }
});

// Sync team with ESPN
router.post('/:teamId/sync', async (req, res) => {
    try {
        const espnRoster = await espnPythonService.getTeamRoster(req.params.teamId);
        const team = await Team.findByPk(req.params.teamId);
        
        // Update players
        for (const playerData of espnRoster) {
            await Player.upsert({
                espn_id: playerData.id,
                team_id: team.id,
                name: playerData.name,
                position: playerData.position
            });
        }
        
        res.json({ message: 'Team synced successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to sync team' });
    }
});

export default router; 