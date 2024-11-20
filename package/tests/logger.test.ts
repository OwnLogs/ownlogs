import Logger from '../src';

export function runLoggerTest() {
  const logger = new Logger({
    backendUrl: 'http://localhost:3000',
    bufferSize: 1
  });
  const messages = ['Test message 1', 'Test message 2', 'Test message 3'];
  const message = messages[Math.floor(Math.random() * messages.length)];
  const actions = [
    () => logger.debug(message),
    () => logger.info(message),
    () => logger.warn(message),
    () => logger.error(message)
  ];
  actions[Math.floor(Math.random() * actions.length)]();
}
