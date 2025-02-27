import express from 'express';
import { Op } from 'sequelize';
import PlayerData from '../../models/PlayerData.js';
import { collectAllPlayers, updatePlayerData } from '../../jobs/collectPlayerData.js';
import { getCurrentWeek } from '../../utils/dateUtils.js';

const router = express.Router();

// Get trending players
router.get('/trending', async (req, res) => {
  try {
    const { position, limit = 10, leagueId, seasonId } = req.query;
    const currentWeek = getCurrentWeek();
    
    if (!leagueId || !seasonId) {
      return res.status(400).json({ error: 'League ID and Season ID are required' });
    }
    
    // Build where clause
    const whereClause = {
      leagueId,
      seasonId,
      week: currentWeek
    };
    
    if (position && position !== 'ALL') {
      whereClause.position = position;
    }
    
    // Get trending up players (highest last game points)
    const trendingUp = await PlayerData.findAll({
      where: {
        ...whereClause,
        actualPoints: { [Op.gt]: 0 }
      },
      order: [['actualPoints', 'DESC']],
      limit: Number(limit)
    });
    
    // Get trending down players (lowest last game points among starters)
    const trendingDown = await PlayerData.findAll({
      where: {
        ...whereClause,
        isRostered: true,
        actualPoints: { [Op.gte]: 0 }
      },
      order: [['actualPoints', 'ASC']],
      limit: Number(limit)
    });
    
    res.json({
      trendingUp: trendingUp.map(p => ({
        id: p.espnId,
        name: p.name,
        team: p.team,
        position: p.position,
        totalPoints: p.actualPoints,
        lastGamePoints: p.actualPoints,
        photoUrl: p.photoUrl,
        isRostered: p.isRostered
      })),
      trendingDown: trendingDown.map(p => ({
        id: p.espnId,
        name: p.name,
        team: p.team,
        position: p.position,
        totalPoints: p.actualPoints,
        lastGamePoints: p.actualPoints,
        photoUrl: p.photoUrl,
        isRostered: p.isRostered
      }))
    });
  } catch (error) {
    console.error('Failed to fetch trending players:', error);
    res.status(500).json({ error: 'Failed to fetch trending players' });
  }
});

// Search players
router.get('/search', async (req, res) => {
  try {
    const { query, position, leagueId, seasonId, limit = 20 } = req.query;
    const currentWeek = getCurrentWeek();
    
    if (!leagueId || !seasonId) {
      return res.status(400).json({ error: 'League ID and Season ID are required' });
    }
    
    // Build where clause
    const whereClause = {
      leagueId,
      seasonId,
      week: currentWeek
    };
    
    if (query) {
      whereClause.name = { [Op.iLike]: `%${query}%` };
    }
    
    if (position && position !== 'ALL') {
      whereClause.position = position;
    }
    
    const players = await PlayerData.findAll({
      where: whereClause,
      order: [['actualPoints', 'DESC']],
      limit: Number(limit)
    });
    
    res.json(players.map(p => ({
      id: p.espnId,
      name: p.name,
      team: p.team,
      position: p.position,
      status: p.status,
      injuryStatus: p.injuryStatus,
      projectedPoints: p.projectedPoints,
      actualPoints: p.actualPoints,
      photoUrl: p.photoUrl,
      isRostered: p.isRostered,
      rosteredTeamId: p.rosteredTeamId
    })));
  } catch (error) {
    console.error('Failed to search players:', error);
    res.status(500).json({ error: 'Failed to search players' });
  }
});

// Get top players by position
router.get('/top/:position', async (req, res) => {
  try {
    const { position } = req.params;
    const { leagueId, seasonId, limit = 20 } = req.query;
    const currentWeek = getCurrentWeek();
    
    if (!leagueId || !seasonId) {
      return res.status(400).json({ error: 'League ID and Season ID are required' });
    }
    
    // Build where clause
    const whereClause = {
      leagueId,
      seasonId,
      week: currentWeek
    };
    
    if (position !== 'ALL') {
      whereClause.position = position;
    }
    
    const players = await PlayerData.findAll({
      where: whereClause,
      order: [['actualPoints', 'DESC']],
      limit: Number(limit)
    });
    
    res.json(players.map(p => ({
      id: p.espnId,
      name: p.name,
      team: p.team,
      position: p.position,
      status: p.status,
      injuryStatus: p.injuryStatus,
      projectedPoints: p.projectedPoints,
      actualPoints: p.actualPoints,
      photoUrl: p.photoUrl,
      isRostered: p.isRostered,
      rosteredTeamId: p.rosteredTeamId
    })));
  } catch (error) {
    console.error('Failed to fetch top players:', error);
    res.status(500).json({ error: 'Failed to fetch top players' });
  }
});

// Manually trigger player data collection
router.post('/collect', async (req, res) => {
  try {
    const { leagueId, seasonId, week, swid, espnS2 } = req.body;
    
    if (!leagueId || !seasonId) {
      return res.status(400).json({ error: 'League ID and Season ID are required' });
    }
    
    const count = await collectAllPlayers(leagueId, seasonId, week, swid, espnS2);
    
    res.json({
      message: `Successfully collected data for ${count} players`,
      count
    });
  } catch (error) {
    console.error('Failed to collect player data:', error);
    res.status(500).json({ error: 'Failed to collect player data' });
  }
});

// Manually trigger player data update
router.post('/update', async (req, res) => {
  try {
    const { leagueId, seasonId, week, swid, espnS2 } = req.body;
    
    if (!leagueId || !seasonId) {
      return res.status(400).json({ error: 'League ID and Season ID are required' });
    }
    
    const count = await updatePlayerData(leagueId, seasonId, week, swid, espnS2);
    
    res.json({
      message: `Successfully updated data for ${count} players`,
      count
    });
  } catch (error) {
    console.error('Failed to update player data:', error);
    res.status(500).json({ error: 'Failed to update player data' });
  }
});

export default router; 