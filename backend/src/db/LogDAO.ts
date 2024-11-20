import DB from '.';
import { format } from 'date-fns';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

class Log {
  id?: number;
  level: LogLevel;
  message: string;
  timestamp: Date;

  constructor(data: Log) {
    this.id = data.id;
    this.level = data.level;
    this.message = data.message;
    this.timestamp = data.timestamp;
  }
}

class LogDAO {
  #db = DB.getInstance();

  async insertLogs(logs: Log[]): Promise<Log[]> {
    const newLogs: Log[] = [];
    for (const log of logs) {
      const newLog = await this.insertLog(log);
      newLogs.push(newLog);
    }
    return newLogs;
  }

  #convertToLog(row: any): Log {
    return new Log({
      id: row.id,
      level: row.level,
      message: row.message,
      timestamp: row.timestamp
    });
  }

  async insertLog(log: Log): Promise<Log> {
    const sql = `
      INSERT INTO logs (level, message, timestamp)
      VALUES (?, ?, ?)
    `;
    const formattedTimestamp = format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss');
    const params = [log.level, log.message, formattedTimestamp];
    const insertId = await this.#db.execute(sql, params);
    log.id = insertId;
    return log;
  }

  async getLogs(
    limit: number = 50,
    offset: number = 0,
    level: LogLevel | 'all'
  ): Promise<{
    logs: Log[];
    total: number;
    hasMore: boolean;
    success: boolean;
    error?: unknown;
  }> {
    try {
      const getLogsSQL = `
        SELECT *
        FROM logs
        ${level !== 'all' ? 'WHERE level = "' + level + '"' : ''}
        ORDER BY timestamp DESC, id DESC
        LIMIT ?
        OFFSET ?
      `;
      const logsRows = await this.#db.query<any[]>(getLogsSQL, [limit, offset]);
      const logs = logsRows.map(this.#convertToLog);
      const totalNumberOfLogsSQL = `
        SELECT COUNT(*) as total
        FROM logs
        ${level !== 'all' ? 'WHERE level = "' + level + '"' : ''}
      `;
      const totalNumberOfLogs = await this.#db.query<any[]>(totalNumberOfLogsSQL);

      return {
        logs,
        total: totalNumberOfLogs[0].total,
        hasMore: totalNumberOfLogs[0].total > offset + limit,
        success: true
      };
    } catch (error) {
      console.error('Error getting logs:', error);
      return {
        logs: [],
        total: 0,
        hasMore: false,
        error: error,
        success: false
      };
    }
  }

  async deleteLog(id: number): Promise<boolean> {
    try {
      const sql = `
        DELETE FROM logs
        WHERE id = ?
      `;
      await this.#db.query(sql, [id]);
      return true;
    } catch (error) {
      console.error('Error deleting log:', error);
      return false;
    }
  }

  async getLogsOverviewStatistics(): Promise<
    { [key in LogLevel]: number } & { recentLogs: Log[] }
  > {
    const statisticsSQL = `
      SELECT level, COUNT(*) as count
      FROM logs
      GROUP BY level;
    `;
    const statisticsRows: { level: LogLevel; count: number }[] =
      await this.#db.query<[]>(statisticsSQL);
    const statistics: { [key in LogLevel]: number } = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    };
    for (const row of statisticsRows) {
      statistics[row.level] = row.count;
    }

    const recentLogs = await this.getLogs(10, 0, 'all');
    return { ...statistics, recentLogs: recentLogs.logs };
  }
}

export default new LogDAO();
