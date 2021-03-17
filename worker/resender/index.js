const { Worker } = require('bullmq');
const redis = require('../../db/redis');
const resendMessages = require('./resendMessages');

const worker = new Worker(
  'resender',
  async (job) => {
    await resendMessages(job.data);
  },
  {
    connection: redis,
    concurrency: 10
  }
);

module.exports = {
  resendMessages,
  worker,
};
