import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import ExpressWebSocket from 'express-ws';
import Logger from './logger';
import { startMonitoring } from './databaseMonitoring';
import { filterIp } from './ipFiltering';
import LogDAO from './db/LogDAO';

// Routes handlers
import { postLogs } from './routes/post/logs';
import { deletedServer } from './routes/post/deletedServer';
import { createdServer } from './routes/post/createdServer';
import { logs } from './routes/ws/logs';
import { logsOverview } from './routes/ws/logsOverview';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('trust proxy', true);
ExpressWebSocket(app);

const router = express.Router();

export class knownServerIdsCache {
  static knownServerIdsCacheValues: number[];

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
}

// /ws routes
router.ws('/getLogsOverviewStatistics', logsOverview);
router.ws('/logs', logs);
app.use('/ws', router);

// /api routes
router.post('/deletedServer', deletedServer);
router.post('/createdServer', createdServer);
app.use('/api', router);

// Receiving logs
app.post('/logs', filterIp, postLogs);

app.get('/', (req: Request, res: Response) => {
  res.send('Hi, you need to send your logs to /logs endpoint');
});

startMonitoring();

app.listen(port, async () => {
  // Settings initial known server ids
  knownServerIdsCache.set(await LogDAO.getKnownServerIds());
  Logger.info(`[server]: Server is running at http://localhost:${port}`);
});
