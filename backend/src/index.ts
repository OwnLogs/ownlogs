import express, { Express, Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import ExpressWebSocket from 'express-ws';
import { EventEmitter } from 'events';
import LogDAO from './db/LogDAO';
import Logger from './logger';
import UserDAO, { type User } from './db/UserDAO';

const app: Express = express();
const port = process.env.PORT || 3000;
const expressWs = ExpressWebSocket(app);
const logEventEmitter = new EventEmitter();
const MAX_LOGS_SENT_PER_REQUEST = 50;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const storeUnauthenticatedRequest = async () => {
  const insertedLogs = await LogDAO.insertLog({
    level: 'warn',
    message: 'An unauthorized request was made to the logging server',
    timestamp: new Date()
  });
  logEventEmitter.emit('newLogs', insertedLogs);
};

const auth = (token: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    if (!token) reject({ error: 'No token was provided!' });
    jwt.verify(token, process.env.JWT_SECRET as string, async (err, decoded: unknown) => {
      if (err) return reject({ error: err });
      const user = await UserDAO.findUserByUsername(decoded as string);
      resolve(user);
    });
  });
};

const authenticate = async (token: string): Promise<boolean> => {
  try {
    const user = await auth(token);
    if (!user) {
      await storeUnauthenticatedRequest();
      return false;
    }
    return true;
  } catch (error) {
    await storeUnauthenticatedRequest();
    return false;
  }
};

interface AuthenticatedRequest extends Request {
  user?: any;
}

const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    await storeUnauthenticatedRequest();
    res.status(401).send('Unauthorized');
    return;
  }
  const auth = await authenticate(token);
  if (!auth) {
    await storeUnauthenticatedRequest();
    res.status(401).send('Unauthorized');
    return;
  }
  next();
};

// WebSocket endpoint to fetch logs
expressWs.app.ws('/ws/logs', async (ws, req) => {
  const token = req.cookies['token'];
  const auth = await authenticate(token);
  if (!auth) {
    await storeUnauthenticatedRequest();
    ws.send(JSON.stringify({ success: false, error: 'Unauthorized' }));
    ws.close();
    return;
  }

  ws.on('message', async (msg: string) => {
    const { action, offset, limit, level = 'all', id, logIds } = JSON.parse(msg);
    switch (action) {
      case 'fetchLogs':
        try {
          const logs = await LogDAO.getLogs(limit || MAX_LOGS_SENT_PER_REQUEST, offset || 0, level);
          if (!logs.success) throw logs.error;
          ws.send(
            JSON.stringify({
              action: 'fetchLogs',
              ...logs,
              success: true,
              offset: (offset || 0) + logs.logs.length
            })
          );
        } catch (error) {
          Logger.error('Error getting logs:', error);
          ws.send(JSON.stringify({ action: 'fetchLogs', success: false, message: error }));
        }
        break;
      case 'deleteLog':
        if (!id) {
          ws.send(
            JSON.stringify({ action: 'deleteLog', success: false, message: 'id is required' })
          );
          return;
        }
        try {
          const deletedLog = await LogDAO.deleteLog(id);
          if (!deletedLog) {
            Logger.error('Log not found');
            ws.send(JSON.stringify({ success: false, error: 'Log not found' }));
          }
          ws.send(JSON.stringify({ action: 'deleteLog', success: true, id }));
        } catch (error) {
          Logger.error('Error deleting log:', error);
          ws.send(JSON.stringify({ action: 'deleteLog', success: false, message: error }));
        }
        break;
      case 'deleteLogs':
        if (!logIds) {
          ws.send(
            JSON.stringify({ action: 'deleteLogs', success: false, message: 'logIds is required' })
          );
          return;
        }
        try {
          for (const id of logIds) {
            const deletedLog = await LogDAO.deleteLog(id);
            if (!deletedLog) {
              Logger.error('Log not found');
              ws.send(JSON.stringify({ success: false, error: 'Log not found' }));
            }
          }
          ws.send(JSON.stringify({ action: 'deleteLogs', success: true }));
        } catch (error) {
          Logger.error('Error deleting log:', error);
          ws.send(JSON.stringify({ action: 'deleteLogs', success: false, message: error }));
        }
        break;
      default:
        Logger.error('Unknown action:', action);
        ws.send(JSON.stringify({ success: false, error: 'Unknown action ' + action }));
        break;
    }
  });

  logEventEmitter.on('newLogs', (logs) => {
    ws.send(JSON.stringify({ action: 'newLogs', success: true, logs }));
  });
});

// REST endpoints
const router = express.Router();

router.get('/getLogsOverviewStatistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const logsOverviewStatistics = await LogDAO.getLogsOverviewStatistics();
    res.status(200).send(logsOverviewStatistics);
  } catch (error) {
    Logger.error('Error getting logs overview statistics:', error);
    res.status(500).send({ status: 'error' });
  }
});

app.use('/api', router);

app.post('/logs', async (req: Request, res: Response) => {
  const logs = req.body;
  try {
    const insertedLogs = await LogDAO.insertLogs(logs);
    logEventEmitter.emit('newLogs', insertedLogs);
    res.status(200).send({ status: 'success' });
  } catch (error) {
    Logger.error('Error inserting logs:', error);
    res.status(500).send({ status: 'error' });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hi, you need to send your logs to /logs endpoint');
});

app.listen(port, () => {
  Logger.info(`[server]: Server is running at http://localhost:${port}`);
});
