const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  gameID: {
    type: String,
    required: true,
    unique: true
  },
  courtName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  date: {
    type: String, //DDMMYYYY
    required: true
  },
  startTime: {
    type: String, //HHMM
    required: true
  },
  endTime: {
    type: String, //HHMM
    required: true
  },
  maximumPlayers: {
    type: Number,
    default: 10,
    min: 4,
    max: 20
  },
  participants: {
    type: Array,
    default: []
  },
  createdByUser: {
    type: String
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
    default: false
  },
  tlvpremium: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    required: true
  },
  requestArray: {
    type: Array,
    default: []
  }
}, {timestamps: true});

// This defines the maximum amount of players in a game as the maximumPlayers value
gameSchema.path('participants').validate(function (participants) {
  return participants.length <= this.maximumPlayers;
}, 'Too many participants');

module.exports = mongoose.model("Game", gameSchema)