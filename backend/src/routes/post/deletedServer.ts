import { Request, Response } from 'express';
import { knownServerIdsCache } from '../../index';
import { authenticate, storeUnauthenticatedRequest } from '../../auth';

export async function deletedServer(req: Request, res: Response) {
  const serverId = req.body.serverId;
  const token = req.cookies['token'];
  const auth = await authenticate(token);

  if (!auth) {
    await storeUnauthenticatedRequest();
    res.status(401).send({ status: 'error', message: 'Unauthorized' });
    return;
  }

  if (!serverId) {
    res.status(400).send({ status: 'error', message: 'serverId is required' });
    return;
  }

  if (knownServerIdsCache.includes(serverId)) {
    res.status(400).send({ status: 'success' });
    return;
  }

  knownServerIdsCache.remove(parseInt(serverId));

  res.status(200).send({ status: 'success' });
}
