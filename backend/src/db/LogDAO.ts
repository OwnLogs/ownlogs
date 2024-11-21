import DB from '.';
import { format } from 'date-fns';
import { IncomingLog, type Log, type LogLevel } from '@shared/types';

class LogDAO {
  async insertLogs(logs: Log[]): Promise<Log[]> {
    const newLogs: Log[] = [];
    for (const log of logs) {
      const newLog = await this.insertLog(log);
      newLogs.push(newLog);
    }
    return newLogs;
  }

  #convertToLog(row: any): Log {
    return row as Log;
  }

  async insertLog(log: IncomingLog): Promise<Log> {
    const sql = `
      INSERT INTO logs (level, message, timestamp, source, serverName)
      VALUES (?, ?, ?, ?, ?)
    `;
    const formattedTimestamp = format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss');
    const params = [log.level, log.message, formattedTimestamp, log.source, log.serverName || null];
    const insertId = await DB.execute(sql, params);
    (log as Log).id = insertId;
    return log as Log;
  }

  async getLogs(
    pageSize: number = 50,
    page: number = 0
  ): Promise<{
    logs: Log[];
    totalLogs: number;
    success: boolean;
    error?: unknown;
  }> {
    try {
      // TODO: fix this ugly ass query
      const getLogsSQL = `
        SELECT *
        FROM logs
        ORDER BY timestamp DESC, id DESC
        LIMIT ?
        OFFSET ?
      `;
      const logsRows = await DB.query<any[]>(getLogsSQL, [pageSize, page * pageSize]);
      const logs = logsRows.map(this.#convertToLog);

      const totalNumberOfLogsSQL = `
        SELECT COUNT(*) as total
        FROM logs
      `;
      const totalNumberOfLogs = await DB.query<any[]>(totalNumberOfLogsSQL);

      return {
        logs,
        totalLogs: totalNumberOfLogs[0].total,
        success: true
      };
    } catch (error) {
      console.error('Error getting logs:', error);
      return {
        logs: [],
        totalLogs: 0,
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
      await DB.query(sql, [id]);
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
    const statisticsRows: { level: LogLevel; count: number }[] = await DB.query<[]>(statisticsSQL);
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

    const recentLogs = await this.getLogs(10, 0);
    return { ...statistics, recentLogs: recentLogs.logs };
  }

  async pruneLogs(limit: number) {
    await DB.query(
      `DELETE logs
       FROM logs
       JOIN (
         SELECT id
         FROM logs
         ORDER BY timestamp ASC
         LIMIT ?
       ) AS subquery ON logs.id = subquery.id;`,
      [limit]
    );
  }
}

export default new LogDAO();
