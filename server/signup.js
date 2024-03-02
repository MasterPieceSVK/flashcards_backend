const express = require("express");
const signUpRouter = express.Router();
const bcrypt = require("bcrypt");
const { createUser } = require("./db");
const validator = require("validator");
const jwt = require("jsonwebtoken");

require("dotenv").config({
  path: ".env",
});

signUpRouter.post("/", async (req, res) => {
  console.log(req.body);
  const { username, password, email } = req.body;

  if (
    validator.isLength(username, { min: 4, max: 15 }) &&
    validator.isEmail(email) &&
    validator.isLength(password, { min: 8, max: 15 })
  ) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("signup");
    const response = await createUser(username, hashedPassword, email);
    console.log(response);

    if (response) {
      const token = jwt.sign(
        { username: response.username },
        process.env.SECRETKEY
      );
      res.json({ token, username });
    } else {
      res.status(409).send("username or email does already exist");
    }
  } else {
    res.status(400).send("wrong format");
  }
});

module.exports = signUpRouter;
