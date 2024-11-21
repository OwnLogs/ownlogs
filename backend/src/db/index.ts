import mysql from 'mysql2/promise';
import { dbConfig } from '../config';

class DB {
  public async query<T extends mysql.RowDataPacket[]>(sql: string, params: any[] = []): Promise<T> {
    const db = await mysql.createConnection(dbConfig);
    if (!db) {
      console.error('No connection to MySQL database.');
      return [] as unknown as T;
    }
    try {
      const [results] = await db.query<T>(sql, params);
      return results;
    } catch (error) {
      console.error('Error executing query:', error);
      return [] as unknown as T;
    } finally {
      db.end();
    }
  }

  public async execute(sql: string, params: any[] = []): Promise<number> {
    const db = await mysql.createConnection(dbConfig);
    if (!db) {
      console.error('No connection to MySQL database.');
      return 0;
    }
    try {
      const [result] = await db.execute(sql, params);
      const insertedId = (result as mysql.ResultSetHeader).insertId;

      return insertedId;
    } catch (error) {
      console.error('Error executing query:', error);
      return 0;
    } finally {
      db.end();
    }
  }

  async getDatabaseSize(): Promise<number> {
    const dbName = dbConfig.database;

    const [rows] = await this.query(
      `SELECT SUM(data_length + index_length) AS size
       FROM information_schema.TABLES
       WHERE table_schema = ?;`,
      [dbName]
    );

    return rows.size || 0; // Size in bytes
  }
}

export default new DB();
