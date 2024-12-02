import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import ExpressWebSocket from 'express-ws';
import Logger from './logger';
import { startMonitoring } from './databaseMonitoring';
import { filterIp } from './ipFiltering';
import LogDAO from './db/LogDAO';
import { monitorServers } from './serverMonitoring/index';

// Routes handlers
import { postLogs } from './routes/post/logs';
import { deletedServer } from './routes/post/deletedServer';
import { createdServer } from './routes/post/createdServer';
import { logs } from './routes/ws/logs';
import { logsOverview } from './routes/ws/logsOverview';
import { getBackendConfig } from '../../shared/configs';
import { deleteLog } from './routes/post/deleteLogs';

const app: Express = express();
const port = process.env.PORT || 3000;
const config = getBackendConfig();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('trust proxy', true);
ExpressWebSocket(app);

const router = express.Router();

export class knownServerIdsCache {
  static knownServerIdsCacheValues: number[];
  static lastChecked: Date = new Date();
  static MAX_CACHE_TIME = config.cachingTime;

  static remove(id: number) {
    knownServerIdsCache.knownServerIdsCacheValues =
      knownServerIdsCache.knownServerIdsCacheValues.filter((serverId) => serverId !== id);
  }

  static add(id: number) {
    knownServerIdsCache.knownServerIdsCacheValues.push(id);
  }

  static includes(id: number) {
    return knownServerIdsCache.knownServerIdsCacheValues.includes(id);
  }

  static set(values: number[]) {
    knownServerIdsCache.knownServerIdsCacheValues = values;
  }

  static get() {
    return knownServerIdsCache.knownServerIdsCacheValues;
  }

  static clear() {
    knownServerIdsCache.knownServerIdsCacheValues = [];
  }

  static async pruneCache() {
    if (
      knownServerIdsCache.lastChecked.getTime() + knownServerIdsCache.MAX_CACHE_TIME <
      Date.now()
    ) {
      knownServerIdsCache.clear();
      await knownServerIdsCache.#updateCache();
      knownServerIdsCache.lastChecked = new Date();
    }
  }

  static async #updateCache() {
    const actualIds = await LogDAO.getKnownServerIds();
    knownServerIdsCache.clear();
    knownServerIdsCache.set(actualIds);
  }
}

// /ws routes
router.ws('/getLogsOverviewStatistics', logsOverview);
router.ws('/logs', logs);
app.use('/ws', router);

// /api routes
router.post('/deletedServer', deletedServer);
router.post('/createdServer', createdServer);
router.post('/deletedLogs', deleteLog);
app.use('/api', router);

// Receiving logs
app.post('/logs', filterIp, postLogs);

app.get('/', (req: Request, res: Response) => {
  res.send('Hi, you need to send your logs to /logs endpoint');
});

app.listen(port, async () => {
  // Monitor database size and prune logs if necessary
  startMonitoring();
  // Settings initial known server ids
  knownServerIdsCache.set(await LogDAO.getKnownServerIds());
  // Prune cache every MAX_CACHE_TIME
  setInterval(knownServerIdsCache.pruneCache, knownServerIdsCache.MAX_CACHE_TIME);
  // Monitor servers
  setInterval(monitorServers, config.monitoring.check_interval);

  Logger.info(`[server]: Server is running at http://localhost:${port}`);
});
