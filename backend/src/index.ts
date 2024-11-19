import express, { Express, Request, Response } from "express";
import 'dotenv/config';
import bodyParser from "body-parser";
import LogDAO from "./db/LogDAO";
import Logger from "./logger";
import ExpressWebSocket from 'express-ws';
import { EventEmitter } from 'events';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const expressWs = ExpressWebSocket(app);

// Create an event emitter instance (for sending logs to WebSocket)
const logEventEmitter = new EventEmitter();

app.get('/', (req: Request, res: Response) => {
  res.send('Hi, you need to send your logs to /logs endpoint');
});

// Endpoint to fetch logs from HTTP
app.get('/api/logs', async(req: Request, res: Response) => {
  try {
    const logs = await LogDAO.getLogs();
    res.send(logs);
  } catch (error) {
    Logger.error("Error getting logs:", error);
    res.status(500).send({ status: 'error' });
  }
});

// Endpoint to fetch logs from WebSocket
expressWs.app.ws('/ws/logs', async(ws, req) => {

  // Send data to client
  const sendData = async() => {
    try {
      const logs = await LogDAO.getLogs();
      ws.send(JSON.stringify(logs));
    } catch (error) {
      Logger.error("Error getting logs:", error);
      ws.send(JSON.stringify({ status: 'error' }));
    }
  }

  // Handle incoming messages
  ws.on('message', async(msg) => {
    switch (msg.toString()) {
      case 'fetch':
        sendData();
        break;
      default:
        Logger.error("Unknown message:", msg);
        ws.send(JSON.stringify({ status: 'error' }));
        break;
    }
  });

  // Listen for new log events and send to client
  logEventEmitter.on('newLogs', (logs) => {
    ws.send(JSON.stringify(logs));
  });

  sendData();
});

// Endpoint to receive logs from package
app.post('/logs', async(req: Request, res: Response) => {
  const logs = req.body;

  try {
    const insertedLogs = await LogDAO.insertLogs(logs);

    // Emit event for new logs
    logEventEmitter.emit('newLogs', insertedLogs);

    res.status(200).send({ status: 'success' });
  } catch (error) {
    Logger.error("Error inserting logs:", error);
    res.status(500).send({ status: 'error' });
  }
});

app.listen(port, () => {
  Logger.info(`[server]: Server is running at http://localhost:${port}`);
});
