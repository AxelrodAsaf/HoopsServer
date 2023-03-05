const Game = require("../models/Game");
const User = require("../models/User");
const Location = require("../models/Location");
require('dotenv').config();

// Create a new game
exports.createGame = async (req, res) => {
  const date = req.body.date;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const participants = req.body.participants;
  const createdByUser = req.body.createdByUser;
  const ageMin = req.body.ageMin;
  const ageMax = req.body.ageMax;
  const level = req.body.level;
  const approved = req.body.approved;
  const tlvpremium = req.body.tlvpremium;
  const price = req.body.price;
  const locationID = req.body.locationID;
  const gameID = date + "/" + startTime + "/" + locationID;

  const newGame = new Game({
    locationID: locationID,
    date: date,
    gameID: gameID,
    startTime: startTime,
    endTime: endTime,
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
    if (await Location.findOne({ locationID: locationID })) {
      if (await Game.findOne({ gameID: gameID })) {
        return res.status(409).json({ message: "Game already exists" });
      }
      else {
        try {
          console.log('\x1b[37m%s\x1b[0m', `Attempting to save a new game created by ${createdByUser}`);
          await newGame.save();
          return res.status(200).json({ message: "Game saved successfully" });
        } catch (err) {
          // console.error(err);
        }
      }
    }
    else {
      return res.status(404).json({ message: "Location not found" });
    }
  }
};

// Approve a game (admin)
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
      return res.status(200).json({ message: "Game approved successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

// Reject a game (admin)
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
      return res.status(200).json({ message: "Game rejected successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

// Delete a game (admin)
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
      return res.status(200).json({ message: "Game deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

// Get all games
exports.gameList = async (req, res) => {
  try {
    const games = await Game.find();
    return res.status(200).json(games);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

// Add a player to a game
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
      return res.status(200).json({ message: "Player added successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

// Remove a player from a game
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
      return res.status(200).json({ message: "Player removed successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

// Get all the players in a list (admin)
exports.playerList = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    // console.log(err)
    return res.status(500).json({ message: err });
  }
}

// Add a location (admin)
exports.addLocation = async (req, res) => {
  const courtNumber = req.body.courtNumber;
  const address = req.body.address;
  const indoor = req.body.indoor;
  const lockerRoom = req.body.lockerRoom;
  const bathroom = req.body.bathroom;
  const showers = req.body.showers;
  const benchSpace = req.body.benchSpace;
  const vendingMachine = req.body.vendingMachine;
  const locationName = req.body.locationName;
  const locationID = (address + "/" + courtNumber).replace(/\s/g, '');
  // Remove all spaces from the locationID
  // locationID = locationID.replace(/\s/g, '');

  const newLocation = new Location({
    locationName: locationName,
    locationID: locationID,
    courtNumber: courtNumber,
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
      return res.status(200).json({ message: "Location saved successfully" });
    } catch (err) {
      // console.error(err);
    }
  }
}

// Remove a location (admin)
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
      return res.status(200).json({ message: "Location deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  }
}

// Get all locations in a list (admin)
exports.locationList = async (req, res) => {
  try {
    const locations = await Location.find();
    return res.status(200).json(locations);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}