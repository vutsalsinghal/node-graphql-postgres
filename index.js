require('dotenv').config()
const bodyParser = require("body-parser")
const cors = require("cors")
const express = require("express");
const knex = require("./db/knex")
var graphqlHTTP = require('express-graphql');
const schema = require("./schema")

const app = express()
app.use(cors(), bodyParser.json())

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

app.get("/", function (req, res) {
  knex.select().table("user").then((data, err) => {
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