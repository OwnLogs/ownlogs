import { BackendConfig } from './types';

export const backendConfig: BackendConfig = {
  // Empty config, going with defaults
  allowedIps: [
    '::ffff:172.18.0.1', // IPv4 localhost
  ]
}
