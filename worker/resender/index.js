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
    concurrency: 5
  }
);

module.exports = {
  resendMessages,
  worker,
};
