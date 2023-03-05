const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Secret key for signing JWT
const secretKey = process.env.JWT_SECRET_KEY;

// Define and export the function 'signup'
exports.signup = async (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  const { firstName, lastName, email, birthDate, phoneNumber, preferredPosition, height, admin } = req.body;
  const playerID = phoneNumber + firstName;

  const newUser = new User({ firstName, lastName, email, password, birthDate, phoneNumber, preferredPosition, height, playerID, admin });

  try {
    console.log('\x1b[37m%s\x1b[0m', `Attempting to save a new user with email: ${newUser.email}`);
    await newUser.save((err, rs) => {
      if (err) {
        return res.status(500).json({ message: err });
      } else {
        console.log(rs);
      }
    });
    return res.status(200).json({ message: "User saved successfully" });
  } catch (err) {
    if (err.code === 11000) { // Duplicate Key
      return res.status(409).json({ message: err });
    } else { // Different error
      return res.status(500).json({ message: err });
    }
  }
};


// Define and export the function 'login'
exports.login = async (req, res) => {
  email = req.body.lowerLoginEmail;
  cleanPassword = req.body.loginPass;

  // Find a user with the given email
  const user = await User.findOne({ email })
  if (user) {
    // Check if the password is correct
    const isMatch = bcrypt.compareSync(cleanPassword, user.password);
    if (isMatch) {
      // Password is correct
      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        birthDate: user.birthDate,
        phoneNumber: user.phoneNumber,
        preferredPosition: user.preferredPosition,
        height: user.height,
        admin: user.admin
      }
      var token = jwt.sign(payload, secretKey);
      token = `Bearer ${token}`;
      console.log('\x1b[32m%s\x1b[0m', `${email} logged in with token: ${token}`);
      res.status(200).json({
        token: token
      });
    }
    // Password is incorrect
    else {
      return res.status(401).json({ message: "Incorrect password" });
    }
  }
  // User not found
  else {
    console.log(`User not found`);
    return res.status(400).json({ message: "User not found." })
  }
}

// When the client makes any request to the server (other than login/signup), check if the token is valid
exports.token = async (req, res, next) => {
  if (req.headers.authorization !== undefined) {
    [, token] = req.headers.authorization.split(' ');
    // Verify token
    if (token !== undefined) {
      var payload = '';
      try {
        // Verify the JWT
        payload = jwt.verify(token, secretKey);
        // Access the payload of the JWT
        console.log('\x1b[35m%s\x1b[0m', `Verified token of user: ${payload.email}`);
        // Add the user's email (from the token) to the request
        req.user = payload.email;
      } catch (error) {
        // Handle error
        console.error(error.message);
      }
    }
  }
  else {
    console.log('\x1b[31m%s\x1b[0m', `No token verified for the request`);
  }
  // Continue to the next handler (with or without the user's email)
  next();
}
