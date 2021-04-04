const { Worker } = require('bullmq');
const redis = require('../../db/redis');
const resendMessages = require('./resendMessages');
const BotModel = require('../../db/models/bot');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config/config.env' });

const worker = new Worker(
  'resender',
  async (job) => {
    console.log('New job started: ', job);
    const stats = await resendMessages(job);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    const { credentials, receiversAmount } = job.data;
    const { username, password } = credentials;

    const botRecord = await BotModel.findOne({
      credentials: { username, password },
    });
    botRecord.stats = {...stats, receiversAmount};
    await botRecord.save();
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
