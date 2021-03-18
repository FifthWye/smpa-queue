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

  BotModel.find({}, (err, bots) => {
    bots.forEach(async ({ credentials, text }) => {
      await addJob(resenderQueue, { credentials, text });
    });
  });
};

worker.on('completed', (job) => console.log(`Completed job ${job.id} successfully finished, all messages resent`));
worker.on('failed', (job, err) => console.log(`Failed job ${job.id} with ${err}`));

console.log('Queue started at ', new Date());
// cron.schedule('05 12 * * *', async () => {
//   producer();
// });

producer();