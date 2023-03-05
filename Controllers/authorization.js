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
  const firstName = req.body.firstName? req.body.firstName : "";
  const lastName = req.body.lastName? req.body.lastName : "";
  const email = req.body.email? req.body.email : "";
  const birthDate = req.body.birthDate? req.body.birthDate : "";
  const phoneNumber = req.body.phoneNumber? req.body.phoneNumber : "";
  const preferredPosition = req.body.preferredPosition? req.body.preferredPosition : "";
  const height = req.body.height? req.body.height : "";
  const admin = req.body.admin;
  const playerID = phoneNumber + firstName;

  const newUser = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: hash,
    birthDate: birthDate,
    phoneNumber: phoneNumber,
    preferredPosition: preferredPosition,
    height: height,
    playerID: playerID,
    admin: admin
  });

  if (!firstName ||!lastName ||!email ||!birthDate ||!phoneNumber ||!preferredPosition ||!height) {
    return res.status(400).json({message: "Please enter all fields"});
  }
  else {
    // Check to see if there is already a user with that phoneNumber
    const tempCheck = await User.findOne({phoneNumber: phoneNumber});
    const tempCheck2 = await User.findOne({email: email});
    if (tempCheck) {
      console.log(tempCheck);
      return res.status(408).json({ message: "Phone number already in use" });
    }
    // Check to see if there is already a user with that email
    else if (tempCheck2) {
      // send a response with error code 409
      return res.status(409);
      // return res.status(409).json({ message: "Email already in use" });
    }
    try {
      console.log('\x1b[37m%s\x1b[0m', `Attempting to save a new user with email: ${newUser.email}`);
      try {
        // await newUser.save();
        const saveRes = await newUser.save();
        // console.log(saveRes);
        return res.status(200).json({ message: "User saved successfully" });
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      if (err.code === 11000) { // Duplicate Key
        return res.status(409).json({ message: err });
      } else { // Different error
        return res.status(500).json({ message: err });
      }
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
    console.log(`User not found while trying to login email: ${email}`);
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
