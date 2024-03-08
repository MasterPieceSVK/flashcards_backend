const express = require("express");
const { saveResult } = require("./db");
const saveResultRouter = express.Router();

saveResultRouter.post("/", async (req, res) => {
  const { setId, right, wrong } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const save = await saveResult(token, right, wrong, setId);
  console.log(save);
  if (save) {
    res.status(201).send("Success");
  } else {
    res.status(400).send("Error");
  }
});

module.exports = saveResultRouter;
