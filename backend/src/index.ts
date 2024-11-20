import express, { Express, Request, Response } from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import LogDAO from './db/LogDAO';
import Logger from './logger';
import ExpressWebSocket from 'express-ws';
import { EventEmitter } from 'events';
import { type LogLevel } from './db/LogDAO';

const app: Express = express();
const port = process.env.PORT || 3000;
const expressWs = ExpressWebSocket(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create an event emitter instance (for sending logs to WebSocket)
const logEventEmitter = new EventEmitter();

const MAX_LOGS_SENT_OER_REQUEST = 10;

app.get('/', (req: Request, res: Response) => {
  res.send('Hi, you need to send your logs to /logs endpoint');
});

// Endpoint to fetch logs from HTTP
app.get('/api/logs', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : MAX_LOGS_SENT_OER_REQUEST;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const level = req.query.level as LogLevel | 'all';
    const logs = await LogDAO.getLogs(limit, offset, level);
    if (!logs.success) {
      throw logs.error;
    }
    res.send({ ...logs, offset: offset + logs.logs.length });
  } catch (error) {
    Logger.error('Error getting logs:', error);
    res.status(500).send({ status: 'error', message: error });
  }
});

// Endpoint to fetch logs from WebSocket
expressWs.app.ws('/ws/logs', async (ws, req) => {
  // Handle incoming messages
  ws.on('message', async (msg) => {
    switch (msg.toString()) {
      default:
        Logger.error('Unknown message:', msg);
        ws.send(JSON.stringify({ status: 'error' }));
        break;
    }
  });

  // Listen for new log events and send to client
  logEventEmitter.on('newLogs', (logs) => {
    ws.send(JSON.stringify(logs));
  });
});

// Endpoint to receive logs from package
app.post('/logs', async (req: Request, res: Response) => {
  const logs = req.body;

  try {
    const insertedLogs = await LogDAO.insertLogs(logs);

    // Emit event for new logs
    logEventEmitter.emit('newLogs', insertedLogs);

    res.status(200).send({ status: 'success' });
  } catch (error) {
    Logger.error('Error inserting logs:', error);
    res.status(500).send({ status: 'error' });
  }
});

app.listen(port, () => {
  Logger.info(`[server]: Server is running at http://localhost:${port}`);
});
