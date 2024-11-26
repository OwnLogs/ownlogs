import { Request, Response } from 'express';
import ServerMonitoringDAO from '../../db/ServerMonitoringDAO';

export function monitoring(req: Request, res: Response) {
  const { serverId, start, end }: { serverId: number; start: Date; end: Date } = req.body;

  if (!serverId) {
    res.status(400).send({ status: 'error', message: 'serverId is required' });
    return;
  }

  if (!start) {
    res.status(400).send({ status: 'error', message: 'start is required' });
    return;
  }

  if (!end) {
    res.status(400).send({ status: 'error', message: 'end is required' });
    return;
  }

  if (end < start) {
    res.status(400).send({ status: 'error', message: 'end must be greater than start' });
    return;
  }

  const data = ServerMonitoringDAO.findServerMonitoringByServerId(serverId, start, end);
  res.status(200).send({ status: 'success', data });
}
