const mongoose = require("mongoose");

// Define a way to save a certain set of fields of data
const gameSchema = new mongoose.Schema({
  gameID: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Number, //DDMMYYYY
    required: true
  },
  startTime: {
    type: Number, //HHMM
    required: true
  },
  endTime: {
    type: Number, //HHMM
    required: true
  },
  locationID: {
    type: String,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
    default: [],
    required: true
  }],
  maximumPlayers: {
    type: Number,
    default: 10,
    min: 4,
    max: 20
  },
  createdByUser: {
    type: String,
    default: "ADMIN PAGE"
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