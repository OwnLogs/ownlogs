import { Request, Response } from 'express';
import LogDAO from '../../db/LogDAO';
import Logger from '../../logger';
import { logEventEmitter } from '../ws/logs';
import { knownServerIdsCache } from '../../index';

export async function postLogs(req: Request, res: Response) {
  const logs = req.body;

  if (!Array.isArray(logs)) {
    res.status(400).send({ status: 'error', message: 'logs should be an array' });
    return;
  }

  if (logs.length === 0) {
    res.status(200).send({ status: 'success' });
    return;
  }

  const serverIds = logs.map((log) => log.serverId);
  if (serverIds.some((serverId) => !knownServerIdsCache.includes(serverId))) {
    console.error(
      `Some server is trying to send some logs and is identified with id=${serverIds.filter((serverId) => !knownServerIdsCache.includes(serverId))[0]}. Please add this server to the database from the web UI or update the serverId property in the configuration of the server trying to send the logs. As a result, the logs were not inserted into the database. The server trying to send logs has the following IP: ${req.ip}`
    );
    res.status(400).send({ status: 'error', message: 'Unknown serverId' });
    return;
  }

  try {
    const insertedLogs = await LogDAO.insertLogs(logs);
    logEventEmitter.emit('newLogs', insertedLogs);
    res.status(200).send({ status: 'success' });
  } catch (error) {
    Logger.error('Error inserting logs:', error);
    res.status(500).send({ status: 'error' });
  }
}
