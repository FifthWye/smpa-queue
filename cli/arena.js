const Arena = require('bull-arena');
const nConf = require('nconf');
const { Queue } = require('bullmq');
const path = require('path');

nConf.argv().env().file({ file: path.join(__dirname, 'envs.json') });

console.log(path.join(__dirname, 'envs.json'));

const redis = {
  host: nConf.get('REDIS_HOST'),
  port: Number(nConf.get('REDIS_PORT')),
  password: nConf.get('REDIS_PASSWORD'),
};

Arena(
  {
    BullMQ: Queue,
    queues: [
      {
        type: 'bullmq',
        name: 'instabot-queue',
        hostId: 'instabot-queue',
        redis
      }
    ]
  },
  {
    basePath: '/'
  }
);
