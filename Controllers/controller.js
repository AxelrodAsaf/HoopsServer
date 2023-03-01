const Game = require("../models/Game");
const Location = require("../models/Location");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.createGame = async (req, res) => {
  const gameID = req.body.gameID;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const location = req.body.location;
  const participants = req.body.participants;
  const createdByUser = req.body.createdByUser;
  const ageMin = req.body.ageMin;
  const ageMax = req.body.ageMax;
  const level = req.body.level;
  const approved = req.body.approved;
  const tlvpremium = req.body.tlvpremium;
  const price = req.body.price;

  const newGame = new Game({
    gameID: gameID,
    startTime: startTime,
    endTime: endTime,
    location: location,
    participants: participants,
    createdByUser: createdByUser,
    ageMin: ageMin,
    ageMax: ageMax,
    level: level,
    tlvpremium: tlvpremium,
    approved: approved,
    price: price
  });

  // Find in the database if the game already exists, if not create it
  if (await Game.findOne({ gameID: gameID })) {
    return res.status(409).json({ message: "Game already exists" });
  }
  else {
    try {
      console.log('\x1b[37m%s\x1b[0m', `Attempting to save a new game with email: ${newGame.gameID}`);
      await newGame.save();
      return res.json({ message: "Game saved successfully" });
    } catch (err) {
      console.error(err);
    }
  }
};

exports.approveGame = async (req, res) => {
  const gameID = req.body.gameID;
  const game = await Game.findOne({ gameID: gameID });

  if (!game) {
    return res.status(404).json({ message: "Game does not exist" });
  }
  else if (game.approved === true) {
    return res.status(409).json({ message: "Game already approved" });
  }
  else {
    try {
      console.log('\x1b[37m%s\x1b[0m', `Attempting to approve game with gameID: ${game.gameID}`);
      game.approved = true;
      await game.save();
      return res.json({ message: "Game approved successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

exports.rejectGame = async (req, res) => {
  const gameID = req.body.gameID;
  const game = await Game.findOne({ gameID: gameID });

  if (!game) {
    return res.status(404).json({ message: "Game does not exist" });
  }
  else if (game.approved === false) {
    return res.status(409).json({ message: "Game is already not approved" });
  }
  else {
    try {
      console.log('\x1b[37m%s\x1b[0m', `Attempting to reject game with gameID: ${game.gameID}`);
      game.approved = false;
      await game.save();
      return res.json({ message: "Game rejected successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

exports.deleteGame = async (req, res) => {
  const gameID = req.body.gameID;
  const game = await Game.findOne({ gameID: gameID });

  if (!game) {
    return res.status(404).json({ message: "Game does not exist" });
  }
  else {
    try {
      console.log('\x1b[37m%s\x1b[0m', `Attempting to delete game with gameID: ${game.gameID}`);
      await Game.deleteOne({ gameID: gameID });
      return res.json({ message: "Game deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

exports.addPlayer = async (req, res) => {
  const gameID = req.body.gameID;
  const player = req.body.player;
  const game = await Game.findOne({ gameID: gameID });

  if (!game) {
    return res.status(404).json({ message: "Game does not exist" });
  }
  else if (game.participants.includes(player)) {
    return res.status(409).json({ message: "Player already in game" });
  }
  else {
    try {
      console.log('\x1b[37m%s\x1b[0m', `Attempting to add player: ${player} to game with gameID: ${game.gameID}`);
      game.participants.push(player);
      await game.save();
      return res.json({ message: "Player added successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

exports.removePlayer = async (req, res) => {
  const gameID = req.body.gameID;
  const player = req.body.player;
  const game = await Game.findOne({ gameID: gameID });

  if (!game) {
    return res.status(404).json({ message: "Game does not exist" });
  }
  else if (!game.participants.includes(player)) {
    return res.status(409).json({ message: "Player not in game" });
  }
  else {
    try {
      console.log('\x1b[37m%s\x1b[0m', `Attempting to remove player: ${player} from game with gameID: ${game.gameID}`);
      game.participants.splice(game.participants.indexOf(player), 1);
      await game.save();
      return res.json({ message: "Player removed successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

exports.addLocation = async (req, res) => {
  const locationID = req.body.locationID;
  const address = req.body.address;
  const indoor = req.body.indoor;
  const lockerRoom = req.body.lockerRoom;
  const bathroom = req.body.bathroom;
  const showers = req.body.showers;
  const benchSpace = req.body.benchSpace;
  const vendingMachine = req.body.vendingMachine;

  const newLocation = new Location({
    locationID: locationID,
    address: address,
    indoor: indoor,
    lockerRoom: lockerRoom,
    bathroom: bathroom,
    showers: showers,
    benchSpace: benchSpace,
    vendingMachine: vendingMachine
  });

  // Find in the database if the location already exists, if not create it
  if (await Location.findOne({ locationID: locationID })) {
    return res.status(409).json({ message: "Location already exists" });
  }
  else {
    try {
      console.log('\x1b[37m%s\x1b[0m', `Attempting to save a new location with locationID: ${newLocation.locationID}`);
      await newLocation.save();
      return res.json({ message: "Location saved successfully" });
    } catch (err) {
      console.error(err);
    }
  }
}

exports.removeLocation = async (req, res) => {
  const locationID = req.body.locationID;
  const location = await Location.findOne({ locationID: locationID });

  if (!location) {
    return res.status(404).json({ message: "Location does not exist" });
  }
  else {
    try {
      console.log('\x1b[37m%s\x1b[0m', `Attempting to delete location with locationID: ${location.locationID}`);
      await Location.deleteOne({ locationID: locationID });
      return res.json({ message: "Location deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}
