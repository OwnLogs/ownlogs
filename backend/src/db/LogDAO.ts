import DB from '.';
import { format } from 'date-fns';

class Log {
  id?: number;
  level: string;
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
      timestamp: row.timestamp,
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

  async getLogs(limit: number = 100): Promise<Log[]> {
    const sql = `
      SELECT id, level, message, timestamp
      FROM logs
      ORDER BY timestamp ASC
      LIMIT ?
    `;
    const rows = await this.#db.query<any[]>(sql, [limit]);
    return rows.map(this.#convertToLog);
  }

  async deleteLog(id: number): Promise<void> {
    const sql = `
      DELETE FROM logs
      WHERE id = ?
    `;
    await this.#db.query(sql, [id]);
  }
}

export default new LogDAO();
