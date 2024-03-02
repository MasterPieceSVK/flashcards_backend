require("dotenv").config({
  path: ".env",
});

const { ParameterizedQuery, as } = require("pg-promise");
const pgp = require("pg-promise")();
const db = pgp(process.env.DATABASE_URL);

async function createUser(username, password, email) {
  const data = [{ username, password, email }];
  const cs = new pgp.helpers.ColumnSet(["username", "password", "email"], {
    table: "users",
  });
  const sql = pgp.helpers.insert(data, cs);
  return db
    .none(sql)
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

async function findUser(username) {
  const findUser = new ParameterizedQuery({
    text: "SELECT * FROM users WHERE username = $1",
    values: [username],
  });
  console.log(username);
  return db
    .one(findUser)
    .then((user) => {
      return user;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
}

async function getIdByUsername(username) {
  const findId = new ParameterizedQuery({
    text: "SELECT user_id FROM users WHERE username = $1",
    values: [username],
  });
  return db
    .one(findId)
    .then((id) => {
      return id.user_id;
    })
    .catch((e) => {
      console.log(e);
    });
}

async function getFlashcardSets(username) {
  const id = await getIdByUsername(username);
  const findSets = new ParameterizedQuery({
    text: "SELECT * FROM flashcard_sets WHERE user_id = $1",
    values: [id],
  });

  return db
    .many(findSets)
    .then((sets) => {
      return sets;
    })
    .catch((e) => {
      console.log(e);
    });
}

module.exports = { createUser, findUser, getFlashcardSets, getIdByUsername };
