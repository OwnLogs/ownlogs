const waitPort = require('wait-port');
const { spawn } = require('child_process');
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
      const child = spawn('npm', ['run', 'start'], { stdio: 'inherit' });

      child.on('error', (err) => {
        console.error(`Error starting server: ${err}`);
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.error(`Server process exited with code ${code}`);
        }
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
