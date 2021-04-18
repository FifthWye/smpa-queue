const resenderQueue = require('./resender');

const addJob = async (queue, data) => {
  const {
    credentials: { username },
  } = data;

  await queue.add(`${new Date().toLocaleString()} | ${username}`, data, { attempts: 2, removeOnComplete: 100, timeout: 14400000 });
};

module.exports = {
  resenderQueue,
  addJob,
};
