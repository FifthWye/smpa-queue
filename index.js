const dotenv = require('dotenv');
const { worker } = require('./worker/resender');
const { resenderQueue, addJob } = require('./queue');
const cron = require('node-cron');
const BotModel = require('./db/models/bot');
const mongoose = require('mongoose');

dotenv.config({ path: './config/config.env' });

process.setMaxListeners(0);

const producer = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  BotModel.find({ active: true }, (err, bots) => {
    bots.forEach(async ({ credentials, config, sessionCookies }) => {
      const { resenderText } = config;
      await addJob(resenderQueue, { credentials, text: resenderText, sessionCookies });
    });
  });
};

worker.on('completed', (job) => console.log(`Completed job ${job.id} successfully finished, all messages resent`));
worker.on('failed', (job, err) => console.log(`Failed job ${job.id} with ${err}`));

console.log('Queue started at ', new Date().toLocaleString());
cron.schedule('00 09 * * *', () => {
  console.log('Running producer');
  producer();
});
