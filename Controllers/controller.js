const Game = require("../models/Game");
const User = require("../models/User");
require('dotenv').config();

// Create a new game
exports.addGame = async (req, res) => {
  console.log(req.body)
  const courtName = req.body.courtName;
  const address = req.body.address;
  const date = req.body.date;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const ageMin = req.body.ageMin;
  const maximumPlayers = req.body.maximumPlayers;
  const ageMax = req.body.ageMax;
  const level = req.body.level;
  const tlvpremium = req.body.tlvpremium;
  const price = req.body.price;
  const createdByUser = req.body.createdByUser;
  const approved = req.body.approved;
  const participants = createdByUser===""? req.body.participants : [...req.body.participants, req.body.createdByUser];
  const gameID = date + "/" + startTime + "/" + address;

  const newGame = new Game({
    courtName: courtName,
    address: address,
    date: date,
    gameID: gameID,
    startTime: startTime,
    endTime: endTime,
    maximumPlayers: maximumPlayers,
    createdByUser: createdByUser,
    participants: participants,
    ageMin: ageMin,
    ageMax: ageMax,
    level: level,
    tlvpremium: (price <= 0)? false : true,
    approved: approved,
    price: price
  });

  console.log(newGame);

  // Find in the database if the game already exists, if not create it
  if (await Game.findOne({ gameID: gameID })) {
    return res.status(409).json({ message: "Game already exists" });
  }
  else {
        try {
          console.log('\x1b[37m%s\x1b[0m', `Attempting to save a new game created by ${createdByUser}`);
          await newGame.save();
          // For each participant, send a request using the sendRequest function
          for (let i = 0; i < newGame.participants.length; i++) {
            console.log('\x1b[37m%s\x1b[0m', `Attempting to send a request to ${newGame.participants[i]}`);
            await sendRequest(newGame.participants[i]);
          }
          return res.status(200).json({ message: "Game saved successfully" });
        } catch (err) {
          console.log(err)
          return res.status(500).json({ message: err });
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

// Get all approved games
exports.gameList = async (req, res) => {
  try {
    const games = await Game.find({ approved: true });
    return res.status(200).json(games);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

// Get all games
exports.allGamesList = async (req, res) => {
  try {
    const games = await Game.find();
    return res.status(200).json(games);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

// Approve a request to join a game
exports.approveRequest = async (req, res) => {
  try {
    const gameID = req.body.gameID;
    const player = req.body.player;

    // Check that the gameID and player fields are present in the request body
    if (!gameID || !player) {
      return res.status(400).json({ message: "Missing gameID or player field in request body" });
    }

    // Find the game and user
    const game = await Game.findOne({ gameID });
    const user = await User.findOne({ email: player });
    if (!game || !user) {
      return res.status(404).json({ message: "Game or player does not exist" });
    }

    // Find the request in the user's requests array
    const request = user.requests.find(request => request.gameID === gameID);
    if (!request) {
      return res.status(404).json({ message: "Request does not exist" });
    }

    // Check if the player is already in the game
    if (game.participants.includes(player)) {
      // Remove the request from the user's request list
      user.requests = user.requests.filter(request => request.gameID !== gameID);

      // Update the user object in the database
      await User.updateOne({ email: player }, { requests: user.requests });

      return res.status(200).json({ message: "Player already in game" });
    }

    // Add the player to the game's participant list
    game.participants.push(player);

    // Remove the request from the user's request list
    user.requests = user.requests.filter(request => request.gameID !== gameID);

    // Update the game and user objects in the database
    await Promise.all([game.save(), User.updateOne({ email: player }, { requests: user.requests })]);

    return res.status(200).json({ message: "Player added to game" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Send a request to a player
exports.sendRequest = async (req, res) => {
  try {
    const gameID = req.body.gameID;
    const player = req.body.player;
    const game = await Game.findOne({ gameID: gameID });
    const user = await User.findOne({ email: player }).lean();

    if (!game) {
      return res.status(404).json({ message: "Game does not exist" });
    } else if (game.participants.includes(player)) {
      return res.status(409).json({ message: "Player already in game" });
    } else if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    } else {
      console.log('Adding request to user:', user);
      user.requests.push({ gameID: gameID, approved: false });
      console.log('Saving user to database:', user);
      await User.updateOne({ email: player }, { $set: { requests: user.requests } });
      console.log('Request sent successfully');
      return res.status(200).json({ message: "Request sent successfully" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

// Reject a request to join a game
exports.rejectRequest = async (req, res) => {
  try {
    const gameID = req.body.gameID;
    const player = req.body.player;
    const game = await Game.findOne({ gameID: gameID });
    const user = await User.findOne({ email: player });

    if (!game) {
      return res.status(404).json({ message: "Game does not exist" });
    }
    else if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    else {
      // Remove the request from the player's request list
      user.requests = user.requests.filter(request => request.gameID!== gameID);
      await user.save();
      return res.status(200).json({ message: "Request rejected successfully" });
    }
  }
  catch (err) {
    console.log(err);
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

// Edit a player's information
exports.editPlayer = async (req, res) => {
  console.log(req.body)
  const firstName = req.body.firstName? req.body.firstName : "";
  const lastName = req.body.lastName? req.body.lastName : "";
  const email = req.body.email? req.body.email : "";
  const birthDate = req.body.birthDate? req.body.birthDate : "";
  const phoneNumber = req.body.phoneNumber? req.body.phoneNumber : "";
  const preferredPosition = req.body.preferredPosition? req.body.preferredPosition : "";
  const height = req.body.height? req.body.height : "";
  const admin = req.body.admin;

  try {
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    existingUser.firstName = (firstName === "")? existingUser.firstName : firstName;
    existingUser.lastName = (lastName === "")? existingUser.lastName : lastName;
    existingUser.email = (email === "")? existingUser.email : email;
    existingUser.birthDate = (birthDate === "")? existingUser.birthDate : birthDate;
    existingUser.phoneNumber = (phoneNumber === "")? existingUser.phoneNumber : phoneNumber;
    existingUser.preferredPosition = (preferredPosition === "")? existingUser.preferredPosition : preferredPosition;
    existingUser.height = (height === "")? existingUser.height : height;
    existingUser.admin = (admin === "")? existingUser.admin : admin;

    const savedUser = await existingUser.save();
    console.log('\x1b[37m%s\x1b[0m', `Attempting to update user with email: ${savedUser.email}`);
    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    if (err.code === 11000) { // Duplicate Key
      console.log(err);
      return res.status(409).json({ message: err });
    } else { // Different error
      console.log(err);
      return res.status(500).json({ message: err });
    }
  }
};

// Delete a player from the database (admin)
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
    console.log(err)
    return res.status(500).json({ message: err });
  }
}

