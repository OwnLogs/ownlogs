import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import ExpressWebSocket from 'express-ws';
import Logger from './logger';
import { startMonitoring } from './databaseMonitoring';

// Routes handlers
import { postLogs } from './routes/post.logs';
import { logsWs } from './routes/ws';
import { logsOverviewWs } from './routes/logsOverviewWs';
import { deleteLog } from './routes/post.deleteLogs';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
ExpressWebSocket(app);

const router = express.Router();

router.ws('/getLogsOverviewStatistics', logsOverviewWs);
router.ws('/logs', logsWs);
app.use('/ws', router);

// Receiving logs
app.post('/logs', postLogs);

app.delete('/deleteLog', deleteLog);

app.get('/', (req: Request, res: Response) => {
  res.send('Hi, you need to send your logs to /logs endpoint');
});

startMonitoring();

app.listen(port, () => {
  Logger.info(`[server]: Server is running at http://localhost:${port}`);
});
