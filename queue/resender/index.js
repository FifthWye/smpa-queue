const { Queue } = require('bullmq');
const redis = require('../../db/redis');

const queue = new Queue('resender', { connection: redis });

module.exports = queue;
