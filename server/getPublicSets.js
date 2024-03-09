const express = require("express");
const { getPublicSets, getMostLikedPublicSets } = require("./db");
const getPublicSetsRouter = express.Router();

getPublicSetsRouter.get("/", async (req, res) => {
  const sets = await getPublicSets();
  const mostLikedSets = await getMostLikedPublicSets();
  if (sets) {
    const obj = {
      mostLikedSets,
      recentSets: sets,
    };
    res.json(obj);
  } else {
    res.status(404).send();
  }
});

module.exports = getPublicSetsRouter;
