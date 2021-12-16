const dotenv = require('dotenv');
const { worker } = require('./worker/autoReply');
const { queue, addJob } = require('./queue');
const cron = require('node-cron');
const BotModel = require('./db/models/bot');
const ReplyModel = require('./db/models/reply');
const mongoose = require('mongoose');

dotenv.config({ path: './config/config.env' });

// process.setMaxListeners(0);

const producer = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  BotModel.find({ isActive: true }, (err, bots) => {
    bots.forEach(async ({ _doc }) => {
      const { _id, credentials, sessionCookies, defaultReply } = _doc;
      const docs = await ReplyModel.find({ botBelongs: _id });
      const replies = docs.map(({ keywords, answer }) => ({ keywords, answer }));
      await addJob(queue, { credentials, replies, sessionCookies, defaultReply });
    });
  });
};

worker.on('completed', (job) => console.log(`Completed job ${job.id} successfully finished`));
worker.on('failed', (job, err) => console.log(`Failed job ${job.id} with ${err}`));

console.log('Queue started at ', new Date().toLocaleString());

cron.schedule('*/2 * * * *', () => {
  console.log('Running producer');
  producer();
});