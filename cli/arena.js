const Arena = require('bull-arena');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: '../../config/config.env' });
const { Queue } = require('bullmq');

const app = express();

const arena = Arena(
  {
    BullMQ: Queue,
    queues: [
      {
        type: 'bullmq',
        name: 'resender-queue',
        hostId: 'worker1',
        url: process.env.REDIS_URI,
      },
    ],
  },
  {
    basePath: '/arena',
    disableListen: true,
  }
);

app.use('/', arena);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
