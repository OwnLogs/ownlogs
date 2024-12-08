import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

const db = await mysql.createPool({
  host: env.NODE_ENV === 'production' ? env.MYSQL_HOST : 'localhost',
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
  debug: false,
  multipleStatements: true,
  timezone: 'Z'
});

export default db;
