const Redis = require("ioredis");
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const redis = new Redis(process.env.REDIS_URL);

module.exports = redis;