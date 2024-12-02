import { Request, Response } from 'express';
import LogDAO from '../../db/LogDAO';
import Logger from '../../logger';
import { authenticate, storeUnauthenticatedRequest } from '../../auth';
import { logEventEmitter } from '../ws/logs';

export async function deleteLog(req: Request, res: Response) {
  const id = req.body.id;
  const ids = req.body.ids;

  if (!id && !ids) {
    res
      .status(200)
      .send({ action: 'deleteLog', success: false, message: 'id or ids are required' });
    return;
  }

  // const token = req.cookies['token'];
  // console.log(req.cookies);
  // const auth = await authenticate(token);
  // console.log(auth);

  // if (!auth) {
  //   await storeUnauthenticatedRequest();
  //   res.status(401).send({ status: 'error', message: 'Unauthorized' });
  //   return;
  // }
  try {
    if (ids) {
      const deletedLogs = await LogDAO.deleteLogs(ids);
      if (!deletedLogs) {
        Logger.error('Logs not found');
        res.status(200).send({ action: 'deleteLog', success: false, error: 'Logs not found' });
      }
      logEventEmitter.emit('logsDeleted', ids);
      res.status(200).send({ action: 'deleteLog', success: true, ids });
    } else {
      const deletedLog = await LogDAO.deleteLog(id);
      if (!deletedLog) {
        Logger.error('Log not found');
        res.status(200).send({ success: false, error: 'Log not found' });
      }
      logEventEmitter.emit('logsDeleted', [id]);
      res.status(200).send({ action: 'deleteLog', success: true, id });
    }
  } catch (error) {
    Logger.error('Error deleting log:', error);
    res.status(200).send({ action: 'deleteLog', success: false, message: error });
  }
}
