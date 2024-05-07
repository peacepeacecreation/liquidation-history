require('dotenv').config()

const express = require('express')
const cors = require('cors')

const coinalyze = require('./routes/coinalyze-router')

const app = express()

// app.use(express.json())
app.use(cors())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
    res.setHeader('Access-Control-Allow-Credentials', true)

    next();
});

app.use(coinalyze)

app.listen(process.env.PORT, () => {
    console.log(` listening on http://localhost:${process.env.PORT}`)
})
