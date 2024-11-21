import { getBackendConfig } from '../../shared/configs';
import DB from './db';
import LogDAO from './db/LogDAO';

const config = getBackendConfig();

async function monitorDatabase() {
  try {
    const size = await DB.getDatabaseSize();

    if (size > config.database.max_database_size) {
      console.log('Database size exceeded limit. Pruning old logs...');
      await LogDAO.pruneLogs(config.database.prune_batch_size);
      console.log(`Pruned ${config.database.prune_batch_size} logs.`);
    }
  } catch (error) {
    console.error('Error monitoring database size:', error);
  }
}

// Run the monitor periodically
export function startMonitoring() {
  monitorDatabase();
  setInterval(monitorDatabase, config.database.prune_interval); // Check every 60 seconds
}
