import { Request, Response } from 'express';
import LogDAO from '../db/LogDAO';
import Logger from '../logger';

export async function deleteLog(req: Request, res: Response) {
  const id = req.body.id;
  if (!id) {
    res.status(200).send({ action: 'deleteLog', success: false, message: 'id is required' });
    return;
  }
  try {
    const deletedLog = await LogDAO.deleteLog(id);
    if (!deletedLog) {
      Logger.error('Log not found');
      res.status(200).send({ success: false, error: 'Log not found' });
    }
    res.status(200).send({ action: 'deleteLog', success: true, id });
  } catch (error) {
    Logger.error('Error deleting log:', error);
    res.status(200).send({ action: 'deleteLog', success: false, message: error });
  }
}
