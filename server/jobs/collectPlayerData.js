import { execPromise } from '../utils/execPromise.js';
import PlayerData from '../models/PlayerData.js';
import { getCurrentWeek } from '../utils/dateUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function collectAllPlayers(leagueId, seasonId, week = null, swid = null, espnS2 = null) {
  const currentWeek = week || getCurrentWeek();
  console.log(`Collecting all players for league ${leagueId}, season ${seasonId}, week ${currentWeek}`);
  
  try {
    // Build command with authentication if provided
    let command = `python3 ${path.join(__dirname, '../python/get_all_players.py')} --league-id ${leagueId} --season-id ${seasonId} --week ${currentWeek}`;
    
    if (swid && espnS2) {
      command += ` --swid ${swid} --espn-s2 ${espnS2}`;
    }
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      console.error('Python script error:', stderr);
      throw new Error(`Python script error: ${stderr}`);
    }
    
    const allPlayers = JSON.parse(stdout);
    console.log(`Retrieved ${allPlayers.length} players`);
    
    // Store all players in database
    const bulkData = allPlayers.map(player => ({
      espnId: player.id,
      leagueId,
      seasonId,
      week: currentWeek,
      name: player.name,
      position: player.position,
      team: player.team,
      teamId: player.teamId,
      status: player.status || 'Free Agent',
      injuryStatus: player.injuryStatus,
      projectedPoints: player.projectedPoints || 0,
      actualPoints: player.actualPoints || 0,
      lineupSlot: player.lineupSlot,
      opponent: player.opponent,
      opponentRank: player.opponentRank,
      photoUrl: player.photoUrl,
      isRostered: player.status !== 'Free Agent',
      rosteredTeamId: player.status !== 'Free Agent' ? player.teamId : null,
      lastUpdated: new Date()
    }));
    
    // Use bulkCreate with updateOnDuplicate to handle existing records
    await PlayerData.bulkCreate(bulkData, {
      updateOnDuplicate: [
        'status', 'injuryStatus', 'projectedPoints', 'actualPoints', 
        'lineupSlot', 'opponent', 'opponentRank', 'isRostered', 
        'rosteredTeamId', 'lastUpdated'
      ]
    });
    
    console.log(`Successfully stored ${bulkData.length} players for week ${currentWeek}`);
    return bulkData.length;
  } catch (error) {
    console.error('Error collecting player data:', error);
    throw error;
  }
}

// Function to update only players with changes
export async function updatePlayerData(leagueId, seasonId, week = null, swid = null, espnS2 = null) {
  const currentWeek = week || getCurrentWeek();
  console.log(`Updating player data for league ${leagueId}, season ${seasonId}, week ${currentWeek}`);
  
  try {
    // First check if we have data for this week already
    const existingCount = await PlayerData.count({
      where: { leagueId, seasonId, week: currentWeek }
    });
    
    // If no data exists for this week, do a full collection
    if (existingCount === 0) {
      return await collectAllPlayers(leagueId, seasonId, currentWeek, swid, espnS2);
    }
    
    // Otherwise, get latest data and update only what changed
    let command = `python3 ${path.join(__dirname, '../python/get_all_players.py')} --league-id ${leagueId} --season-id ${seasonId} --week ${currentWeek}`;
    
    if (swid && espnS2) {
      command += ` --swid ${swid} --espn-s2 ${espnS2}`;
    }
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      console.error('Python script error:', stderr);
      throw new Error(`Python script error: ${stderr}`);
    }
    
    const latestPlayers = JSON.parse(stdout);
    let updatedCount = 0;
    
    // Update each player individually to avoid unnecessary updates
    for (const player of latestPlayers) {
      const [playerData, created] = await PlayerData.findOrCreate({
        where: {
          espnId: player.id,
          leagueId,
          seasonId,
          week: currentWeek
        },
        defaults: {
          name: player.name,
          position: player.position,
          team: player.team,
          teamId: player.teamId,
          status: player.status || 'Free Agent',
          injuryStatus: player.injuryStatus,
          projectedPoints: player.projectedPoints || 0,
          actualPoints: player.actualPoints || 0,
          lineupSlot: player.lineupSlot,
          opponent: player.opponent,
          opponentRank: player.opponentRank,
          photoUrl: player.photoUrl,
          isRostered: player.status !== 'Free Agent',
          rosteredTeamId: player.status !== 'Free Agent' ? player.teamId : null,
          lastUpdated: new Date()
        }
      });
      
      if (!created) {
        // Check if anything changed before updating
        const hasChanges = 
          playerData.status !== (player.status || 'Free Agent') ||
          playerData.injuryStatus !== player.injuryStatus ||
          playerData.projectedPoints !== (player.projectedPoints || 0) ||
          playerData.actualPoints !== (player.actualPoints || 0) ||
          playerData.lineupSlot !== player.lineupSlot ||
          playerData.opponent !== player.opponent ||
          playerData.opponentRank !== player.opponentRank ||
          playerData.isRostered !== (player.status !== 'Free Agent') ||
          playerData.rosteredTeamId !== (player.status !== 'Free Agent' ? player.teamId : null);
        
        if (hasChanges) {
          playerData.status = player.status || 'Free Agent';
          playerData.injuryStatus = player.injuryStatus;
          playerData.projectedPoints = player.projectedPoints || 0;
          playerData.actualPoints = player.actualPoints || 0;
          playerData.lineupSlot = player.lineupSlot;
          playerData.opponent = player.opponent;
          playerData.opponentRank = player.opponentRank;
          playerData.isRostered = player.status !== 'Free Agent';
          playerData.rosteredTeamId = player.status !== 'Free Agent' ? player.teamId : null;
          playerData.lastUpdated = new Date();
          
          await playerData.save();
          updatedCount++;
        }
      } else {
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} players for week ${currentWeek}`);
    return updatedCount;
  } catch (error) {
    console.error('Error updating player data:', error);
    throw error;
  }
} 