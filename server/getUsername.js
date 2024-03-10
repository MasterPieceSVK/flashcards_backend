const express = require("express");
const getUsernameByToken = require("./getUsernameByToken");
const getUsernameRouter = express.Router();

getUsernameRouter.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const username = await getUsernameByToken(token);

  res.json(username);
});

module.exports = getUsernameRouter;
