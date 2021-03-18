const { Worker } = require('bullmq');
const redis = require('../../db/redis');
const resendMessages = require('./resendMessages');

const worker = new Worker(
  'resender',
  async (job) => {
    console.log("New job added: ",job)
    await resendMessages({ ...job.data, jobId: job.id });
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

module.exports = {
  resendMessages,
  worker,
};
