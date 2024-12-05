import random
from logger import Logger

def run_logger_test():
  logger = Logger({
    'backendUrl': 'http://localhost:3000',
    'bufferSize': 1,
    'serverId': 2
  })

  message = 'Test message'
  actions = [
    lambda i: logger.debug(f"{message} {i}"),
    lambda i: logger.info(f"{message} {i}"),
    lambda i: logger.warn(f"{message} {i}"),
    lambda i: logger.error(f"{message} {i}"),
    lambda i: logger.fatal(f"{message} {i}")
  ]

  for i in range(10):
    random.choice(actions)(i)

if __name__ == "__main__":
  run_logger_test()
