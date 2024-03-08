require("dotenv").config({
  path: ".env",
});

const { ParameterizedQuery, as } = require("pg-promise");
const getUsernameByToken = require("./getUsernameByToken");
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

async function createSet(set_name, username, qa, public) {
  const created_at = new Date().toISOString();
  const id = await getIdByUsername(username);
  data = [
    { user_id: id, set_name, created_at, likes_count: 0, is_public: public },
  ];

  let cs = new pgp.helpers.ColumnSet(
    ["user_id", "set_name", "created_at", "likes_count", "is_public"],
    {
      table: "flashcard_sets",
    }
  );
  let sql = pgp.helpers.insert(data, cs);
  const create = await db
    .none(sql)
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
  if (create) {
    const findSetId = new ParameterizedQuery({
      text: "SELECT set_id FROM flashcard_sets WHERE user_id = $1 AND created_at=$2",
      values: [id, created_at],
    });
    const setId = await db
      .one(findSetId)
      .then((data) => {
        return data.set_id;
      })
      .catch((e) => console.log(e));

    let formattedData = qa.map((item) => {
      return {
        set_id: setId,
        question: item.question,
        answer: item.answer,
        created_at,
        is_public: public,
        user_id: id,
      };
    });

    let cs = new pgp.helpers.ColumnSet(
      ["set_id", "question", "answer", "created_at", "is_public", "user_id"],
      {
        table: "flashcards",
      }
    );

    let sql = pgp.helpers.insert(formattedData, cs);

    db.none(sql)
      .then((data) => console.log(data))
      .catch((e) => {
        console.log(e);
      });
  } else {
    res.status(500).send("An eror occured");
  }
}

async function getQA(setId, id) {
  console.log("set id " + setId);

  const publicPrivate = new ParameterizedQuery({
    text: "SELECT is_public FROM flashcard_sets WHERE set_id = $1",
    values: [setId],
  });
  const { is_public } = await db
    .one(publicPrivate)
    .then((set) => {
      return set;
    })
    .catch((e) => {
      console.log(e);
    });
  console.log(is_public);

  let findQA = "";
  if (is_public) {
    findQA = new ParameterizedQuery({
      text: "SELECT question,answer FROM flashcards WHERE set_id = $1",
      values: [setId],
    });
  } else {
    findQA = new ParameterizedQuery({
      text: "SELECT question,answer FROM flashcards WHERE set_id = $1 AND user_id=$2",
      values: [setId, id],
    });
  }

  return db
    .many(findQA)
    .then((qa) => {
      return qa;
    })
    .catch((e) => {
      console.log(e);
    });
}

async function saveResult(token, right, wrong, set_id) {
  const username = await getUsernameByToken(token);

  const user_id = await getIdByUsername(username);

  const data = {
    set_id,
    right,
    wrong,
    user_id,
  };
  let cs = new pgp.helpers.ColumnSet(["set_id", "right", "wrong", "user_id"], {
    table: "results",
  });

  let sql = pgp.helpers.insert(data, cs);
  return db
    .none(sql)
    .then(() => {
      return true;
    })
    .catch((e) => {
      console.log(e);
      return false;
    });
}

module.exports = {
  createUser,
  findUser,
  getFlashcardSets,
  getIdByUsername,
  createSet,
  getQA,
  saveResult,
};
