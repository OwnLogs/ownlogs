import mysql, { RowDataPacket } from 'mysql2/promise';
import { dbConfig } from '../config';

class DB {
  private connection: mysql.Connection | null = null;
  private static instance: DB | null = null;

  private constructor() {}

  public static getInstance(): DB {
    if (!this.instance) {
      this.instance = new DB();
    }
    return this.instance;
  }

  public async connect(): Promise<void> {
    if (!this.connection) {
      try {
        
        this.connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database.');
      } catch (error) {
        console.error('Error connecting to MySQL database:', error);
        throw error;
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.end();
        console.log('Disconnected from MySQL database.');
        this.connection = null;
      } catch (error) {
        console.error('Error disconnecting from MySQL database:', error);
        throw error;
      }
    }
  }

  public getConnection(): mysql.Connection | null {
    return this.connection;
  }

  public static async query<T extends mysql.RowDataPacket[]>(
    sql: string,
    params: any[] = []
  ): Promise<T> {
    const dbInstance = DB.getInstance();
    await dbInstance.connect();
    const db = dbInstance.getConnection();
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
    }
  }

  public static async execute(sql: string, params: any[] = []): Promise<number> {
    const dbInstance = DB.getInstance();
    await dbInstance.connect();
    const db = dbInstance.getConnection();
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
    }
  }

  public static async getDatabaseSize(): Promise<number> {
    const dbName = dbConfig.database;
    try {
      const [rows] = await DB.query<RowDataPacket[]>(
        `SELECT SUM(data_length + index_length) AS size
         FROM information_schema.TABLES
         WHERE table_schema = ?;`,
        [dbName]
      );
      return rows?.size || 0; // Size in bytes
    } catch (error) {
      console.error('Error getting database size:', error);
      return 0;
    }
  }
}

export default DB;
