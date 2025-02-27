import express from 'express';
import espnPythonService from '../services/espnPythonService.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const teams = await espnPythonService.getTeams();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

router.get('/:teamId/roster', async (req, res) => {
    try {
        const roster = await espnPythonService.getTeamRoster(req.params.teamId);
        res.json(roster);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch roster' });
    }
});

export default router; 