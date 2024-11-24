import { BackendConfig } from './types';

export const backendConfig: BackendConfig = {
  // Empty config, going with defaults
  allowedIps: [
    '::ffff:127.0.0.1', // IPv4 localhost
    '::ffff:172.18.0.1', // My local IP for testing purposes
  ]
}
