const { Worker } = require('bullmq');
const redis = require('../../db/redis');
const autoReply = require('./autoReply');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const worker = new Worker(
  'autoReply',
  async (job) => {
    console.log('New job added: ', job.id);
    await autoReply(job);
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

module.exports = {
  autoReply,
  worker,
};
