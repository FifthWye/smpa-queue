const { Worker } = require('bullmq');
const redis = require('../../db/redis');
const resendMessages = require('./resendMessages');

const worker = new Worker(
  'resender',
  async (job) => {
    console.log('New job started: ', job);
    await resendMessages(job);
  },
  {
    connection: redis,
    concurrency: 6,
  }
);

module.exports = {
  resendMessages,
  worker,
};
