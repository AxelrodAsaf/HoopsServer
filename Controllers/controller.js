const Game = require("../models/Game");
const User = require("../models/User");
const Location = require("../models/Location");
require('dotenv').config();

// Create a new game
exports.addGame = async (req, res) => {
  console.log(req.body)
  const date = req.body.date;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const ageMin = req.body.ageMin;
  const ageMax = req.body.ageMax;
  const level = req.body.level;
  const maximumPlayers = req.body.maximumPlayers;

  const tlvpremium = req.body.tlvpremium;
  const price = req.body.price;
  const createdByUser = req.body.createdByUser;
  const locationID = req.body.locationID;

  const approved = req.body.approved;
  const participants = req.body.participants;
  const gameID = date + "/" + startTime + "/" + locationID;

  const newGame = new Game({
    locationID: locationID,
    date: date,
    gameID: gameID,
    startTime: startTime,
    endTime: endTime,
    participants: participants,
    maximumPlayers: maximumPlayers,
    createdByUser: createdByUser,
    ageMin: ageMin,
    ageMax: ageMax,
    level: level,
    tlvpremium: tlvpremium,
    approved: approved,
    price: price
  });

  console.log(newGame);

  // Find in the database if the game already exists, if not create it
  if (await Game.findOne({ gameID: gameID })) {
    return res.status(409).json({ message: "Game already exists" });
  }
  else {
    if (await Location.findOne({ locationID: locationID })) {
        try {
          console.log('\x1b[37m%s\x1b[0m', `Attempting to save a new game created by ${createdByUser}`);
          await newGame.save();
          return res.status(200).json({ message: "Game saved successfully" });
        } catch (err) {
          return res.status(500).json({ message: err });
        }
    }
    else {
      console.log(`Location ${locationID} does not exist`);
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
exports.removeGame = async (req, res) => {
  const gameID = req.body.gameID;
  const game = await Game.findOne({ gameID: gameID });
  console.log(gameID, game)

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
    const games = await Game.find().populate("participants");
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

// Delete a player from the database
exports.removePlayer = async (req, res) => {
  try {
    // Find the player with the playerID within the database and delete it
    const player = await User.deleteOne({ playerID: req.body.playerID });
    if (!player.deletedCount) {
      return res.status(404).json({ message: "Player does not exist" });
    }
    else {
      return res.status(200).json({ message: "Player deleted successfully" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Remove a player from a game
exports.removeFromGame = async (req, res) => {
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
      return res.status(400).json({ message: err });
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