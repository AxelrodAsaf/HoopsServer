const mongoose = require("mongoose");

// Define a way to save a certain set of fields of data
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    birthDate: {
        type: String, //DDMMYYYY
        required: true,
    },
    phoneNumber: {
        type: String, //##########
        required: true,
        unique: true
    },
    preferredPosition: {
        type: String,
        required: true,
    },
    height: {
        type: Number, //###     (in cm)
        required: true,
    },
    requests: {
        type: Object,
        default: []
    },
    admin: {
        type: Boolean,
        default: false,
    },
    playerID: {
        type: String,
        required: false
    }
},{timestamps: true});

// Export the schema
module.exports = mongoose.model("User", userSchema)
