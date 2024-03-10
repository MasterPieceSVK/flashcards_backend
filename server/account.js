const express = require("express");
const getUsernameByToken = require("./getUsernameByToken");
const {
  changeUsername,
  findUser,
  findUserByEmail,
  changeEmail,
  changePassword,
  getIdByUsername,
  deleteAccount,
} = require("./db");
const accountRouter = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config({
  path: ".env",
});

accountRouter.put("/change-username", async (req, res) => {
  const { newUsername, password } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const oldUsername = await getUsernameByToken(token);

  const user = await findUser(oldUsername);
  if (user) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const change = await changeUsername(newUsername, oldUsername);
      if (change) {
        const username = newUsername;
        const token = jwt.sign({ username }, process.env.SECRETKEY);
        res.status(201).json({
          newUsername,
          token,
        });
      } else {
        res.status(404).send("Username is already being used or another error");
      }
    } else {
      res.status(401).send("wrong credentials");
    }
  } else {
    res.status(404).send("User not found");
  }
});
accountRouter.put("/change-email", async (req, res) => {
  const { newEmail, actualPassword } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const username = await getUsernameByToken(token);
  const { email, password } = await findUser(username);

  const match = await bcrypt.compare(actualPassword, password);
  if (match) {
    const change = await changeEmail(email, newEmail);
    if (change) {
      res.status(201).json({
        newEmail,
      });
    } else {
      res.status(404).send("Email is already being used or another error");
    }
  } else {
    res.status(401).send("wrong credentials");
  }
});

accountRouter.put("/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const username = await getUsernameByToken(token);
  const { password } = await findUser(username);

  const match = await bcrypt.compare(oldPassword, password);
  if (match) {
    const change = await changePassword(oldPassword, newPassword, username);
    if (change) {
      res.status(201).send("Success");
    } else {
      res.status(500).send("Something went wrong");
    }
  } else {
    res.status(401).send("Wrong crendentials");
  }
});

accountRouter.delete("/delete-account", async (req, res) => {
  const { actualPassword } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const username = await getUsernameByToken(token);
  if (!username) {
    res.status(404).send("Invalid token");
  }
  const user_id = await getIdByUsername(username);
  const { password } = await findUser(username);
  if (!token) {
    res.status(404).send("No token");
  }

  const match = await bcrypt.compare(actualPassword, password);
  if (match) {
    const deleteAction = await deleteAccount(user_id);
    console.log(deleteAction);
    if (deleteAction) {
      res.status(204).json({ Success: true });
    } else {
      res.status(500).send("server error");
    }
  } else {
    res.status(401).send("Wrong credentials");
  }
});

module.exports = accountRouter;
