const express = require("express");
const signUpRouter = express.Router();
const bcrypt = require("bcrypt");
const { createUser } = require("./db");

signUpRouter.post("/", async (req, res) => {
  const { username, password, email } = req.body;

  if (username.length > 0 && email.length > 0 && password.length > 0) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const response = await createUser(username, hashedPassword, email);
    console.log(response);

    if (response) {
      res.json({ username, hashedPassword, email });
    } else {
      res.status(404).send("username or email does already exist");
    }
  } else {
    res.status(404).send("missing credentials");
  }
});

module.exports = signUpRouter;
