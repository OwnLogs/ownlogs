type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
type Log = { level: LogLevel; message: string, timestamp?: Date };
type Config = { backendUrl: string, bufferSize?: number };

class Logger {
  #backendUrl: string;
  #buffer: Array<Log> = [];
  #bufferSize: number = 10; // Number of logs before sending
  #isFlushing: boolean = false; // Flag to indicate if a flush is in progress
  #queue: Array<Log> = []; // Queue to store logs while flushing
  #COLORS: Map<string, string> = new Map([
    ["red", "\x1b[31m"],
    ["green", "\x1b[32m"],
    ["yellow", "\x1b[33m"],
    ["blue", "\x1b[34m"],
    ["magenta", "\x1b[35m"],
    ["cyan", "\x1b[36m"],
    ["white", "\x1b[37m"],
    ["black", "\x1b[30m"],
    ["reset", "\x1b[0m"],
    ["bgRed", "\x1b[41m"],
    ["bgGreen", "\x1b[42m"],
    ["bgYellow", "\x1b[43m"],
    ["bgBlue", "\x1b[44m"],
    ["bgMagenta", "\x1b[45m"],
    ["bgCyan", "\x1b[46m"],
    ["bgWhite", "\x1b[47m"],
  ]);

  static #formatMessage(...messages: any[]): string {
    return messages.join(" ");
  }

  debug(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    console.log(`${this.#COLORS.get("bgWhite")}${this.#COLORS.get("black")}[ DEBUG ]${this.#COLORS.get("reset")} ${message}`);
    this.#pushLog({ level: "debug", message, timestamp: new Date() });
  }

  info(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    console.log(`${this.#COLORS.get("bgBlue")}[ INFO ]${this.#COLORS.get("reset")} ${message}`);
    this.#pushLog({ level: "info", message, timestamp: new Date() });
  }

  warn(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    console.warn(`${this.#COLORS.get("bgYellow")}[ WARN ]${this.#COLORS.get("reset")} ${message}`);
    this.#pushLog({ level: "warn", message, timestamp: new Date() });
  }

  error(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    console.error(`${this.#COLORS.get("bgRed")}[ ERROR ]${this.#COLORS.get("reset")} ${message}`);
    this.#pushLog({ level: "error", message, timestamp: new Date() });
  }

  fatal(...messages: any[]) {
    const message = Logger.#formatMessage(messages);
    console.error(`${this.#COLORS.get("red")}[ FATAL ]${this.#COLORS.get("reset")} ${message}`);
    this.#pushLog({ level: "fatal", message, timestamp: new Date() });
  }

  constructor(config: Config) {
    if (!config.backendUrl) {
      throw new Error("backendUrl property is required");
    }
    this.#backendUrl = config.backendUrl.replace(/\/$/, "");

    if (config.bufferSize) {
      if (config.bufferSize <= 0) {
        throw new Error("bufferSize must be greater than 0");
      }
      this.#bufferSize = config.bufferSize;
    }
  }

  #pushLog(log: Log) {
    this.#buffer.push(log);
    if (this.#buffer.length >= this.#bufferSize) {
      this.#flush();
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
        await fetch(this.#backendUrl + '/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logsToSend),
        });
      }
    } catch (error) {
      console.error("Failed to send logs:", error);
      // Re-add unsent logs to the queue
      this.#queue.push(...this.#buffer);
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
