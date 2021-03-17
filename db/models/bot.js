const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  credentials: {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  config: {
    resenderText: [{ type: String, trim: true }],
  },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
  ],
});

const BotModel = mongoose.model('Bot', botSchema);

module.exports = BotModel;
