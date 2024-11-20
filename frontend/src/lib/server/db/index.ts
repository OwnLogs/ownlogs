import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';
import { MYSQL_PASSWORD, MYSQL_USER, MYSQL_HOST, MYSQL_DATABASE } from '$env/static/private';

if (!MYSQL_PASSWORD) throw new Error('MYSQL_PASSWORD is not set');
if (!MYSQL_USER) throw new Error('MYSQL_USER is not set');
if (!MYSQL_HOST) throw new Error('MYSQL_HOST is not set');
if (!MYSQL_DATABASE) throw new Error('MYSQL_DATABASE is not set');

const db = await mysql.createPool({
  host: env.NODE_ENV === 'development' ? 'localhost' : MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
  debug: false,
  multipleStatements: true
});

export default db;
