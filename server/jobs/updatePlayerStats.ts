import { ESPNService } from '../services/espn';
import PlayerStats from '../models/PlayerStats';
import { getCurrentWeek } from '../utils';

export async function updatePlayerStats() {
  const espnService = new ESPNService(/* config */);
  const currentWeek = getCurrentWeek();

  try {
    // Fetch top 200 players overall
    const topPlayers = await espnService.getTopPlayers(200);
    
    // Fetch top players by position
    const positions = ['QB', 'RB', 'WR', 'TE', 'DST'];
    const topPositionalPlayers = await Promise.all(
      positions.map(async (pos) => ({
        position: pos,
        players: await espnService.getTopPlayersByPosition(pos, 15)
      }))
    );

    // Combine and deduplicate players
    const allPlayers = [...new Set([
      ...topPlayers,
      ...topPositionalPlayers.flatMap(p => p.players)
    ])];

    // Update database
    for (const player of allPlayers) {
      await PlayerStats.upsert({
        playerId: player.id,
        name: player.name,
        team: player.team,
        position: player.position,
        totalPoints: player.totalPoints,
        lastGamePoints: player.weeklyPoints[currentWeek] || 0,
        weeklyPoints: player.weeklyPoints,
        rank: player.rank,
        positionRank: player.positionRank,
        lastUpdated: new Date()
      });
    }

    console.log(`Updated stats for ${allPlayers.length} players`);
  } catch (error) {
    console.error('Failed to update player stats:', error);
    throw error;
  }
} 