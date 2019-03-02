require('dotenv').config()
const bodyParser = require("body-parser")
const cors = require("cors")
const express = require("express");
const session = require("cookie-session")
const knex = require("./db/knex")
var graphqlHTTP = require('express-graphql');
const schema = require("./schema")

const app = express()
app.use(cors('*'), bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30 * 12, // 1 year
    sameSite: true, // or 'strict'
    secure: process.env.NODE_ENV === 'production'
  }
}))

app.use('/graphql', graphqlHTTP(req => ({
  schema,
  graphiql: true,
  rootValue: {
    session: req.session
  }
})));

app.get("/", function (req, res) {
  knex.select().table("user").then((data, err) => {
    console.log(req.session);
    res.send(data)
  });
});

app.get("/user/:uid/calorie-intake/", async (req, res) => {
  const data = await knex.select("id", "intake").table("calorie-intake").where("user_id", req.params.uid)
  res.send(data);
});

app.get("/user/:uid/calorie-intake/add/:amount", async (req, res) => {
  let data = await knex("calorie-intake").where("user_id", '=', req.params.uid).update({ intake: req.params.amount }, ["id", "intake"])
  res.send(data);
});

app.listen(process.env.PORT);