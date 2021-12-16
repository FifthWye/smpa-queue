const autoReplyQueue = require('./autoReply');

const addJob = async (queue, data) => {
  const {
    credentials: { username },
    replies,
  } = data;

  if (replies.length !== 0)
    await queue.add(`${new Date().toLocaleString()} | ${username}`, data, {
      attempts: 1,
      removeOnComplete: 360,
      timeout: 12000,
    });
};

module.exports = {
  queue: autoReplyQueue,
  addJob,
};
