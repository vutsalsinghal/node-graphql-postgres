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

app.get("/user/:uid/calorie-intake/", function (req, res) {
  console.log(req);
  knex.select().table("calorie-intake").where("user_id", req.params.uid).then((data, err) => {
    res.send(data)
  });
});

app.listen(process.env.PORT);