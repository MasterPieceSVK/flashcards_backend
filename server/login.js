const express = require("express");
const loginRouter = express.Router();
const bcrypt = require("bcrypt");
const { findUser } = require("./db");
const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: ".env",
});
loginRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  const user = await findUser(username);
  if (user) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign({ username }, process.env.SECRETKEY);
      res.json({ token, username });
    } else {
      res.status(404).send("Incorrect Credentials");
    }
  } else {
    res.status(404).send("User does not exist");
  }
});

module.exports = loginRouter;
