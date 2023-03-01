const mongoose = require("mongoose");

// Define a way to save a certain set of fields of data
const gameSchema = new mongoose.Schema({
  gameID: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Number,
    required: true
  },
  endTime: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  participants: {
    type: Array,
    required: false,
    default: []
  },
  createdByUser: {
    type: String,
    required: true
  },
  ageMin: {
    type: Number,
    required: true
  },
  ageMax: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    required: true,
    default: false
  },
  tlvpremium: {
    type: Boolean,
    required: true,
    default: false
  },
  price: {
    type: Number,
    required: true
  }

})

// Export the schema
module.exports = mongoose.model("Game", gameSchema)