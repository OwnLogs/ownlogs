import 'dotenv/config';

export interface dbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  waitForConnections: boolean;
  debug: boolean;
  multipleStatements: boolean;
}

console.log(process.env.DB_PASSWORD);


export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 100,
  waitForConnections: true,
  debug: false,
  multipleStatements: true
};
