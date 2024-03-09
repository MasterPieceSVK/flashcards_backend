const express = require("express");
const { getIdByUsername, getUserInfo } = require("./db");
const getUsernameByToken = require("./getUsernameByToken");
const userInfoRouter = express.Router();

userInfoRouter.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const username = await getUsernameByToken(token);
  const user_id = await getIdByUsername(username);

  const info = await getUserInfo(user_id, username);
  if (info) {
    res.json(info);
  } else {
    res.status(404).send();
  }
});

module.exports = userInfoRouter;
