require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');
const port = process.env.PORT || 8000;
const authorization = require("./Controllers/authorization");
const controller = require("./Controllers/controller");

// Connection to the mongodb server
mongoose.set("strictQuery", false);
const mongooseURL = process.env.MONGOOSE_URL;
mongoose.connect(mongooseURL, {})
  .then(() => {
    console.log("Connected to monbodb successfully.");
    console.log('\x1b[32m%s\x1b[0m', `+----------------------------+`);
  })
  .catch(error => {
    console.log("There was an error connecting to mongodb.");
    console.log(error);
  })

// Help parse the body of the request
app.use(bodyParser.json());

// Permit all to send/receive data
app.use(cors());

// When the client tries to react a certain '/XXX' call a function (authController.XXX)
app.post("/signup", authorization.signup);
app.post("/login", authorization.login);

// Using app.use make sure that the token is valid for all requests
app.use(authorization.token);

// Player section
app.post("/addPlayer", controller.addPlayer);
app.post("/removePlayer", controller.removePlayer);
app.post("/removeFromGame", controller.removeFromGame);
app.post("/playerList", controller.playerList);

// Game section
app.post("/addGame", controller.addGame);
app.post("/approveGame", controller.approveGame);
app.post("/rejectGame", controller.rejectGame);
app.post("/removeGame", controller.removeGame);
app.post("/gameList", controller.gameList);

// Location section
app.post("/addLocation", controller.addLocation);
app.post("/removeLocation", controller.removeLocation);
app.post("/locationList", controller.locationList);

// Run the server on port with a console.log to tell the backend "developer"
app.listen(port, () => {
  console.log('\x1b[32m%s\x1b[0m', `+----------------------------+`);
  console.log(`Starting connection to port ${port}.`);
});


// ++++++++++++++++++ Console.log() commands to change colors of the output: ++++++++++++++++++
// console.log('\x1b[31m%s\x1b[0m', 'This text is red.');
// console.log('\x1b[32m%s\x1b[0m', 'This text is green.');
// console.log('\x1b[33m%s\x1b[0m', 'This text is yellow.');
// console.log('\x1b[34m%s\x1b[0m', 'This text is blue.');
// console.log('\x1b[35m%s\x1b[0m', 'This text is magenta.');
// console.log('\x1b[36m%s\x1b[0m', 'This text is cyan.');
// console.log('\x1b[37m%s\x1b[0m', 'This text is white.');
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++