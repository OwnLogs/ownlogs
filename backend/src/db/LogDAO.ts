import DB from '.';
import { format } from 'date-fns';
import { IncomingLog, type Log, type LogLevel } from '@shared/types';
import { sendEmail } from '../SMTP';
import UserDAO from './UserDAO';

class LogDAO {
  async insertLogs(logs: Log[]): Promise<Log[]> {
    const newLogs: Log[] = [];
    const usersToEmail: string[] = await UserDAO.getUsersToEmail(logs[0].serverId);
    for (const log of logs) {
      if (log.level === 'fatal' || log.level === 'error') {
        for (const email of usersToEmail) {
          await sendEmail(
            email,
            `Critical Log Alert: ${log.level}`,
            `Log message: ${log.message}\nTimestamp: ${log.timestamp}`
          );
        }
      }
      const newLog = await this.insertLog(log);
      newLogs.push(newLog);
    }
    return newLogs;
  }

  #convertToLog(row: any): Log {
    return row as Log;
  }

  async insertLog(log: IncomingLog): Promise<Log> {
    if (!log.serverId) {
      throw new Error('Server ID is required to insert a log');
    }
    const sql = `
      INSERT INTO logs (level, message, timestamp, source, serverId)
      VALUES (?, ?, ?, ?, ?)
    `;
    const formattedTimestamp = format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss');

    const params = [log.level, log.message, formattedTimestamp, log.source, log.serverId];
    const insertId = await DB.execute(sql, params);
    (log as Log).logId = insertId;
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
      const getLogsSQL = `
        SELECT
        logs.id logId,
        logs.level logLevel,
        logs.message logMessage,
        logs.source logSource,
        logs.timestamp logTimestamp,
        server.id serverId,
        server.name serverName,
        server.description serverDescription,
        server.publicUrl serverUrl
        FROM logs
        JOIN server ON logs.serverId = server.id
        ORDER BY logs.timestamp DESC, logs.id DESC
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

  async getKnownServerIds(): Promise<number[]> {
    const sql = `
      SELECT id
      FROM server
    `;
    const rows = await DB.query<any[]>(sql);
    return rows.map((row) => row.id);
  }
}

export default new LogDAO();
