const waitPort = require('wait-port');
const { exec } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const opts = {
  host: process.env.MYSQL_HOST,
  port: 3306,
  timeout: 30000
};

waitPort(opts)
  .then((open) => {
    if (open) {
      console.log('MySQL is up - starting server');
      exec('node dist/index.js', (err, stdout, stderr) => {
        if (err) {
          console.error(`Error starting server: ${err}`);
          return;
        }
        console.log(stdout);
        console.error(stderr);
      });
    } else {
      console.error('MySQL is not available');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error(`Error waiting for MySQL: ${err}`);
    process.exit(1);
  });
