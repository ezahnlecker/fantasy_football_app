import cron from 'node-cron';
import { updatePlayerStats } from './jobs/updatePlayerStats';

// Run every Tuesday at 4am (after all Monday night games are complete)
cron.schedule('0 4 * * 2', async () => {
  console.log('Running weekly player stats update...');
  try {
    await updatePlayerStats();
    console.log('Player stats update completed');
  } catch (error) {
    console.error('Player stats update failed:', error);
  }
}); 