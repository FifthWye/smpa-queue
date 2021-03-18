const resenderQueue = require('./resender');

const addJob = async (queue, data) => {
  const {
    credentials: { username },
  } = data;

  await queue.add(`${new Date().toLocaleString()} | ${username}`, data, { attempts: 1, removeOnComplete: 50, delay: 5000 });
};

module.exports = {
  resenderQueue,
  addJob,
};
