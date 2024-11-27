import { type IncomingLog } from 'shared/types';

type Config = { backendUrl: string; bufferSize?: number; serverId: number };

class Logger {
  #backendUrl: string;
  #buffer: Array<IncomingLog> = [];
  #bufferSize: number = 10; // Number of logs before sending
  #isFlushing: boolean = false; // Flag to indicate if a flush is in progress
  #queue: Array<IncomingLog> = []; // Queue to store logs while flushing
  #serverId: number; // Name of the server
  #numberOfRetiesToFetch: number = 0;
  static #MAX_RETRIES = 3;
  static #COLORS: Map<string, string> = new Map([
    ['red', '\x1b[31m'],
    ['green', '\x1b[32m'],
    ['yellow', '\x1b[33m'],
    ['blue', '\x1b[34m'],
    ['magenta', '\x1b[35m'],
    ['cyan', '\x1b[36m'],
    ['white', '\x1b[37m'],
    ['black', '\x1b[30m'],
    ['reset', '\x1b[0m'],
    ['bgRed', '\x1b[41m'],
    ['bgGreen', '\x1b[42m'],
    ['bgYellow', '\x1b[43m'],
    ['bgBlue', '\x1b[44m'],
    ['bgMagenta', '\x1b[45m'],
    ['bgCyan', '\x1b[46m'],
    ['bgWhite', '\x1b[47m']
  ]);

  static #formatMessage(...messages: any[]): string {
    return messages.join(' ');
  }

  /**
   * Extracts the file path and line number of the caller from the stack trace.
   *
   * @returns {string} The source of the log (file path and line number).
   * @private
   */
  static #getCallerInfo(): string {
    const error = new Error();
    const stack = error.stack?.split('\n') || [];
    const callerLine = stack[3]?.trim();
    const match = callerLine?.match(/\((.*):(\d+):(\d+)\)/); // Extract file path and line number
    if (match) {
      const [_, filePath, lineNumber] = match;
      return `${filePath}:${lineNumber}`;
    }

    return 'unknown';
  }

  debug(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    const source = Logger.#getCallerInfo();
    console.log(
      `${Logger.#COLORS.get('bgWhite')}${Logger.#COLORS.get('black')}[ DEBUG ]${Logger.#COLORS.get('reset')} ${message}`
    );
    this.#pushLog({ level: 'debug', message, source, timestamp: new Date() });
  }

  info(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    const source = Logger.#getCallerInfo();
    console.log(`${Logger.#COLORS.get('bgBlue')}[ INFO ]${Logger.#COLORS.get('reset')} ${message}`);
    this.#pushLog({ level: 'info', message, source, timestamp: new Date() });
  }

  warn(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    const source = Logger.#getCallerInfo();
    console.warn(
      `${Logger.#COLORS.get('bgYellow')}[ WARN ]${Logger.#COLORS.get('reset')} ${message}`
    );
    this.#sendLogImmediately({ level: 'warn', message, source, timestamp: new Date() });
  }

  error(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    const source = Logger.#getCallerInfo();
    console.error(
      `${Logger.#COLORS.get('bgRed')}[ ERROR ]${Logger.#COLORS.get('reset')} ${message}`
    );
    this.#sendLogImmediately({
      level: 'error',
      message,
      source,
      timestamp: new Date()
    });
  }

  fatal(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    const source = Logger.#getCallerInfo();
    console.error(`${Logger.#COLORS.get('red')}[ FATAL ]${Logger.#COLORS.get('reset')} ${message}`);
    this.#sendLogImmediately({
      level: 'fatal',
      message,
      source,
      timestamp: new Date()
    });
  }

  constructor(config: Config) {
    if (!config.backendUrl) {
      throw new Error('backendUrl property is required');
    }
    // Remove trailing slash from URL
    this.#backendUrl = config.backendUrl.replace(/\/$/, '');

    if (config.bufferSize) {
      if (config.bufferSize <= 0) {
        throw new Error('bufferSize must be greater than 0');
      }
      this.#bufferSize = config.bufferSize;
    }

    this.#serverId = config.serverId;
  }

  #pushLog(log: IncomingLog) {
    log.serverId = this.#serverId;
    this.#buffer.push(log);
    if (this.#buffer.length >= this.#bufferSize) {
      this.#flush();
    }
  }

  async #sendLogImmediately(log: IncomingLog) {
    log.serverId = this.#serverId;
    try {
      await fetch(this.#backendUrl + '/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([log])
      });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }

  async #flush() {
    if (this.#isFlushing) {
      return;
    }
    this.#isFlushing = true;
    try {
      while (this.#buffer.length > 0) {
        const logsToSend = this.#buffer.splice(0, this.#bufferSize);
        try {
          const res = await fetch(this.#backendUrl + '/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logsToSend)
          });

          if (!res.ok) {
            throw new Error(`Failed to send logs: ${res.statusText}`);
          }
        } catch (error) {
          console.error('Failed to send logs:', error);
          // Re-add unsent logs to the buffer
          this.#buffer.push(...logsToSend);
          break;
        }
      }
    } catch (error) {
      console.error('Failed to send logs:', error);
      // Re-add unsent logs to the queue if the maximum number of retries has not been reached
      if (this.#numberOfRetiesToFetch < Logger.#MAX_RETRIES) {
        this.#queue.push(...this.#buffer);
        this.#numberOfRetiesToFetch++;
      } else {
        console.error('Failed to send logs after multiple retries');
      }
    } finally {
      this.#isFlushing = false;
      // Process any logs that were added to the queue while flushing
      if (this.#queue.length > 0) {
        this.#buffer.push(...this.#queue);
        this.#queue = [];
        this.#flush();
      }
    }
  }
}

export default Logger;
