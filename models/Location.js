const mongoose = require("mongoose");

// Define a way to save a certain set of fields of data
const locationSchema = new mongoose.Schema({
  locationID: {
    type: Number,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  indoor: {
    type: Boolean,
    required: true,
  },
  lockerRoom: {
    type: Boolean,
    required: true,
  },
  bathroom: {
    type: Boolean,
    required: true,
  },
  showers: {
    type: Boolean,
    required: true,
  },
  benchSpace: {
    type: Number,
    required: true,
  },
  vendingMachine: {
    type: Boolean,
    required: true,
  }
})

// Export the schema
module.exports = mongoose.model("Location", locationSchema)