import express from 'express';
import { ProposedTrade, TradeAnalysis, Team, Player } from '../../models/index.js';

const router = express.Router();

// Get all trades for a league
router.get('/league/:leagueId', async (req, res) => {
    try {
        const trades = await ProposedTrade.findAll({
            where: { league_id: req.params.leagueId },
            include: [
                {
                    model: Team,
                    attributes: ['name']
                },
                {
                    model: TradeAnalysis
                }
            ]
        });
        res.json(trades);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
});

// Propose new trade
router.post('/', async (req, res) => {
    try {
        const trade = await ProposedTrade.create({
            league_id: req.body.leagueId,
            proposer_team_id: req.body.proposerTeamId,
            trade_details: req.body.tradeDetails,
            status: 'pending'
        });

        // Create initial analysis
        await TradeAnalysis.create({
            trade_id: trade.id,
            analysis_text: 'Trade analysis pending...',
            metrics: {
                proposerValue: 0,
                receiverValue: 0,
                fairnessScore: 0
            }
        });

        res.status(201).json(trade);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create trade' });
    }
});

// Update trade status
router.put('/:tradeId/status', async (req, res) => {
    try {
        const trade = await ProposedTrade.findByPk(req.params.tradeId);
        trade.status = req.body.status;
        await trade.save();
        res.json(trade);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update trade status' });
    }
});

// Update trade analysis
router.put('/:tradeId/analysis', async (req, res) => {
    try {
        const [analysis] = await TradeAnalysis.upsert({
            trade_id: req.params.tradeId,
            analysis_text: req.body.analysisText,
            metrics: req.body.metrics
        });
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update analysis' });
    }
});

export default router; 