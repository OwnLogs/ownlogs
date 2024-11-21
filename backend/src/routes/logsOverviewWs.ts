import { Request } from 'express';
import LogDAO from '../db/LogDAO';
import Logger from '../logger';
import WebSocket from 'ws';
import { authenticate, storeUnauthenticatedRequest } from '../auth';
import osu from 'node-os-utils';
import { ServerStatistics } from '@shared/types';
import DB from '../db';

const INTERVAL_BETWEEN_UPDATES = 1000;

async function getServerStatistics(): Promise<ServerStatistics> {
  const uptime = process.uptime();
  const memoryUsage = await osu.mem.info();
  const cpuUsage = await osu.cpu.usage();
  const databaseSize = await DB.getDatabaseSize();

  return {
    uptime,
    memoryUsage,
    cpuUsage,
    databaseSize
  };
}

export async function logsOverviewWs(ws: WebSocket, req: Request) {
  const token = req.cookies['token'];
  const auth = await authenticate(token);

  if (!ws) return;
  if (!auth) {
    await storeUnauthenticatedRequest();
    ws.send(JSON.stringify({ success: false, error: 'Unauthorized' }));
    ws.close();
    return;
  }

  // Send initial data
  try {
    const logsOverviewStatistics = await LogDAO.getLogsOverviewStatistics();
    const serverStatistics = await getServerStatistics();
    ws.send(
      JSON.stringify({
        action: 'initial',
        success: true,
        logsOverviewStatistics,
        serverStatistics
      })
    );
  } catch (error) {
    Logger.error('Error getting logs overview statistics:', error);
    ws.send(
      JSON.stringify({
        action: 'initial',
        success: false,
        message: 'Error getting logs overview statistics'
      })
    );
    return;
  }

  // Send periodic updates
  const intervalId = setInterval(async () => {
    const serverStatistics = await getServerStatistics();
    ws.send(JSON.stringify({ action: 'serverStatisticsUpdate', serverStatistics, success: true }));
  }, INTERVAL_BETWEEN_UPDATES);

  ws.on('close', () => {
    clearInterval(intervalId);
  });
}
