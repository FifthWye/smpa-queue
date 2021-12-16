const Arena = require('bull-arena');
const { Queue } = require('bullmq');

const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const redis = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
};

try {
  Arena(
    {
      BullMQ: Queue,
      queues: [
        {
          type: 'bullmq',
          name: 'autoReply',
          hostId: 'autoReply',
          redis,
        },
      ],
    },
    {
      basePath: '/',
    }
  );
} catch (error) {
  console.log(error);
}
