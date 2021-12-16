const { Queue } = require('bullmq');
const redis = require('../../db/redis');

const queue = new Queue('autoReply', { connection: redis });

module.exports = queue;
