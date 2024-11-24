import { FinalBackendConfig } from './types';
import { backendConfig } from './backend.config';

function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function deepMerge(target: any, ...sources: any[]): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return deepMerge(target, ...sources);
}

export const dbConfig = {
  host: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
  debug: false,
  multipleStatements: true
};

const defaultBackendConfig: FinalBackendConfig = {
  database: {
    max_database_size: 1 * 1024 * 1024 * 1024, // 1 GB in bytes
    prune_batch_size: 1000, // Remove 1000 logs at a time
    prune_interval: 1 * 60 * 60 // 1 minute
  },
  allowedIps: [
    '::ffff:127.0.0.1', // IPv4 localhost
  ],
  cachingTime: 1000 * 60, // 1 minute
};

export const getBackendConfig = (): FinalBackendConfig => {
  return deepMerge(defaultBackendConfig, backendConfig) as FinalBackendConfig;
}
