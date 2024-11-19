import Logger from '../src';

export function runLoggerTest() {
  const logger = new Logger({ backendUrl: 'http://localhost:3000', bufferSize:1 });
  logger.warn('Test error 1');
  logger.error('Test error 2');
  logger.fatal('Test error 3');
  logger.info('Test error 4');
  logger.debug('Test error 5');
}
