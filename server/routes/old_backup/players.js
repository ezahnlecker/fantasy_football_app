import express from 'express';
import espnPythonService from '../services/espnPythonService.js';

const router = express.Router();

router.get('/top/:position', async (req, res) => {
    try {
        const players = await espnPythonService.getTopPlayersByPosition(req.params.position);
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top players' });
    }
});

router.get('/debug', async (req, res) => {
    try {
        const debug = await espnPythonService.debugLeagueMethods();
        res.json(debug);
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to debug methods',
            details: error.message 
        });
    }
});

export default router; 