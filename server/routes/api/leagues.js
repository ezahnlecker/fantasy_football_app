import express from 'express';
import { League, Team, LeagueSettings } from '../../models/index.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

// Get user's leagues
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const leagues = await League.findAll({
            where: { user_id: req.params.userId },
            include: [LeagueSettings]
        });
        res.json(leagues);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }
});

// Create new league
router.post('/', auth, async (req, res) => {
    try {
        const league = await League.create(req.body);
        if (req.body.settings) {
            await LeagueSettings.create({
                league_id: league.id,
                ...req.body.settings
            });
        }
        res.status(201).json(league);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create league' });
    }
});

// Update league settings
router.put('/:leagueId/settings', async (req, res) => {
    try {
        const [settings] = await LeagueSettings.upsert({
            league_id: req.params.leagueId,
            ...req.body
        });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router; 