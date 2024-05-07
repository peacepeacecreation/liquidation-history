require('dotenv').config()

const express = require('express')
const cors = require('cors')

const coinalyze = require('./routes/coinalyze-router')

const app = express()

// app.use(express.json())
app.use(cors())

app.use(coinalyze)

app.listen(process.env.PORT, () => {
    console.log(` listening on http://localhost:${process.env.PORT}`)
})
