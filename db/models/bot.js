const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema(
  {
    userCreated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instagramUrl: String,
    isActive: {
      type: Boolean,
      default: false,
    },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
    userModerators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sessionCookies: { type: String, default: "", trim: true },
    defaultReply: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const BotModel = mongoose.model('Bot', BotSchema);

module.exports = BotModel;
