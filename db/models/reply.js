const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema(
  {
    botBelongs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
      required: true
    },
    keywords: {
      type: Array,
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const ReplyModel = mongoose.model('Reply', ReplySchema);


module.exports = ReplyModel;
