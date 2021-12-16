const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const options = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 0,
  enableReadyCheck: false,
};

const redis = new Redis(options);

module.exports = redis;
