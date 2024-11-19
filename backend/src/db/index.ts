import mysql from 'mysql2/promise';
import { dbConfig } from '../config';
import Logger from '../logger';

class DB {
  private static instance: DB;
  private connection: mysql.Pool | null = null;
  #config = dbConfig;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  private async initialize() {
    try {
      this.connection = await mysql.createPool(this.#config);
      await this.query(`
        CREATE TABLE IF NOT EXISTS logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          level VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      Logger.info("Database initialized and connected.");
    } catch (error) {
      Logger.error("Error initializing database:", error);
    }
  }

  public async query<T extends mysql.RowDataPacket[]>(sql: string, params: any[] = []): Promise<T> {
    if (!this.connection) {
      console.error("No connection to MySQL database.");
      return [] as unknown as T;
    }
    try {
      const [results] = await this.connection.query<T>(sql, params);
      return results;
    } catch (error) {
      console.error("Error executing query:", error);
      return [] as unknown as T;
    }
  }

  public async execute(sql: string, params: any[] = []): Promise<number> {
    if (!this.connection) {
      console.error("No connection to MySQL database.");
      return 0;
    }
    try {
      const [result] = await this.connection.execute(sql, params);
      const insertedId = (result as mysql.ResultSetHeader).insertId;

      return insertedId;
    } catch (error) {
      console.error("Error executing query:", error);
      return 0;
    }
  }

  public async close() {
    if (this.connection) {
      await this.connection.end();
      console.log("MySQL connection closed.");
    }
    this.connection = null;
  }
}

export default DB;
