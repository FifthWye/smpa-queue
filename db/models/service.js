const mongoose = require("mongoose");

const ServiceModel = mongoose.model(
  "Service",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  })
);

module.exports = ServiceModel;
