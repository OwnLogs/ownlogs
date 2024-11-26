export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface IncomingLog {
  level: LogLevel;
  message: string;
  timestamp: Date;
  source?: string;
  serverId?: number;
}

export interface Log extends IncomingLog {
  logId: number;
  logLevel: LogLevel;
  logMessage: string;
  logSource: string;
  logTimestamp: Date;
  serverId: number;
  serverName: string;
  serverDescription?: string;
  serverUrl: string | null;
}


export interface ServerStatistics {
  uptime: number;
  memoryUsage: { totalMemMb: number; usedMemMb: number; freeMemMb: number; freeMemPercentage: number; };
  cpuUsage: number;
  databaseSize: number; // in bytes
}

export interface Server {
  id?: number;
  description?: string;
  name: string;
  publicUrl?: string;
  isOnline?: boolean;
}

export interface ServerMonitoring {
  id?: number;
  serverId: number;
  isOnline: boolean;
  timestamp: Date;
}


// CONFIGS
export interface BackendConfig {
  database?: {
    max_database_size?: number;
    prune_batch_size?: number;
    prune_interval?: number;
  },
  allowedIps?: string[];
  SMTP?: {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    },
    sendingFrom?: string;
  },
  monitoring?: {
    check_interval?: number;
  }
}
export interface FinalBackendConfig extends BackendConfig {
  database: {
    max_database_size: number;
    prune_batch_size: number;
    prune_interval: number;
  },
  allowedIps: string[];
  cachingTime: number;
  SMTP: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    },
    sendingFrom: string;
  },
  monitoring: {
    check_interval: number;
  }
}
