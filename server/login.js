const express = require("express");
const loginRouter = express.Router();
const bcrypt = require("bcrypt");
const { findUser } = require("./db");

loginRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  const user = await findUser(username);
  if (user) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.json({
        username,
      });
    } else {
      res.status(404).send("Incorrect Password");
    }
  } else {
    res.status(404).send("User does not exist");
  }
});

module.exports = loginRouter;
