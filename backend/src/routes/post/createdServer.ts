import { Request, Response } from 'express';
import { knownServerIdsCache } from '../../index';

export function createdServer(req: Request, res: Response) {
  const serverId = req.body.serverId;

  if (!serverId) {
    res.status(400).send({ status: 'error', message: 'serverId is required' });
    return;
  }

  if (knownServerIdsCache.includes(serverId)) {
    res.status(200).send({ status: 'success' });
    return;
  }

  knownServerIdsCache.add(serverId);

  res.status(200).send({ status: 'success' });
}
