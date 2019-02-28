require('dotenv').config()
const bodyParser = require("body-parser")
const cors = require("cors")
const express = require("express");

const app = express()
app.use(cors(), bodyParser.json())

app.get("/", function (req, res) {
    res.send("hello!")
});

app.listen(process.env.PORT);