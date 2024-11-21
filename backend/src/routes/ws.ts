import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { Log } from '@shared/types';
import { authenticate, storeUnauthenticatedRequest } from '../auth';
import LogDAO from '../db/LogDAO';
import Logger from '../logger';
import { Request } from 'express';

const MAX_LOGS_SENT_PER_REQUEST = 10;

export const logEventEmitter = new EventEmitter();

export async function logsWs(ws: WebSocket, req: Request) {
  const token = req.cookies['token'];
  const auth = await authenticate(token);

  if (!ws) return;
  if (!auth) {
    await storeUnauthenticatedRequest();
    ws.send(JSON.stringify({ success: false, error: 'Unauthorized' }));
    ws.close();
    return;
  }

  // Isolate the function that sends data for event listeners purposes
  const sendNewLogs = async (logs: Log[]) => {
    ws.send(JSON.stringify({ action: 'newLogs', success: true, logs }));
  };

  // When the lient requests data
  ws.on('message', async (msg: WebSocket.MessageEvent) => {
    const { action, page, pageSize = 30, logIds, realTime } = JSON.parse(msg as unknown as string);

    switch (action) {
      case 'fetchLogs': {
        try {
          const logs = await LogDAO.getLogs(pageSize, page || 0);

          if (!logs.success) throw logs.error;
          ws.send(
            JSON.stringify({
              action: 'fetchLogs',
              ...logs,
              success: true,
              page: page || 0,
              pageSize: pageSize
            })
          );
        } catch (error) {
          Logger.error('Error getting logs:', error);
          ws.send(JSON.stringify({ action: 'fetchLogs', success: false, message: error }));
        }
        break;
      }
      case 'deleteLogs': {
        if (!logIds) {
          ws.send(
            JSON.stringify({ action: 'deleteLogs', success: false, message: 'logIds is required' })
          );
          return;
        }
        try {
          for (const id of logIds) {
            const deletedLog = await LogDAO.deleteLog(id);
            if (!deletedLog) {
              Logger.error('Log not found');
              ws.send(JSON.stringify({ success: false, error: 'Log not found' }));
            }
          }
          const logs = await LogDAO.getLogs(pageSize, page || 0);
          ws.send(JSON.stringify({ action: 'deleteLogs', success: true, logs }));
        } catch (error) {
          Logger.error('Error deleting log:', error);
          ws.send(JSON.stringify({ action: 'deleteLogs', success: false, message: error }));
        }
        break;
      }
      case 'changeRealTime': {
        if (realTime) {
          logEventEmitter.on('newLogs', sendNewLogs);
        } else {
          logEventEmitter.removeListener('newLogs', sendNewLogs);
        }
        break;
      }
      default: {
        Logger.error('Unknown action:', action);
        ws.send(JSON.stringify({ success: false, error: 'Unknown action ' + action }));
        break;
      }
    }
  });

  // Add the listener to send new logs to the client
  logEventEmitter.on('newLogs', sendNewLogs);

  ws.on('close', () => {
    // Remove the listener for new logs when the client disconnects
    logEventEmitter.removeListener('newLogs', sendNewLogs);
  });
}
