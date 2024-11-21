import { Request, Response } from 'express';
import LogDAO from '../db/LogDAO';
import Logger from '../logger';
import { logEventEmitter } from './ws';

export async function postLogs(req: Request, res: Response) {
  const logs = req.body;

  try {
    const insertedLogs = await LogDAO.insertLogs(logs);
    logEventEmitter.emit('newLogs', insertedLogs);
    res.status(200).send({ status: 'success' });
  } catch (error) {
    Logger.error('Error inserting logs:', error);
    res.status(500).send({ status: 'error' });
  }
}
