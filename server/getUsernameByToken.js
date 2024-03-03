const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: ".env",
});

function getUsernameByToken(token) {
  return jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
    if (err) {
      return false;
    }
    const username = decoded.username;

    return username;
  });
}

module.exports = getUsernameByToken;
