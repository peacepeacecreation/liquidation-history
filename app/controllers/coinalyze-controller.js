const moment = require('moment')
const axios = require('axios')

axios.defaults.baseURL = process.env.COINALYZE_URL
axios.defaults.headers['api_key'] = process.env.COINALYZE_API_KEY

const apiKey = {
    minutes: 0,
    data: [
        process.env.COINALYZE_API_KEY,
        process.env.COINALYZE_API_KEY2,
    ],
    used: []
}

const reRequest = (callback, req, res, error) => {
    apiKey.minutes = moment(Date.now()).format('mm')
    apiKey.used.push(axios.defaults.headers['api_key'])

    const updateTime = () => {
        const minutes = moment(Date.now()).format('mm')

        if (minutes !== apiKey.minutes)
            apiKey.used = []

            clearTimeout(updateTime)

        setTimeout(updateTime, 1000)
    }

    updateTime()

    const freeApiKey = apiKey.data.find((key) => !apiKey.used.includes(key))
    if (freeApiKey) {
        axios.defaults.headers['api_key'] = freeApiKey
        callback(req, res)
    } else {
        res.status(500).send(error)
    }
}

const handleError = (callback, req, res, error) => {
    if (error.response.status == 429) {
        reRequest(callback, req, res, error)
    } else {
        res.status(500).send(error)
    }
}

const getAllMarkets = async (req, res) => {
    try {
        const { data } = await axios.get('future-markets')

        return res.status(200).json(data)
    } catch (error) {
        handleError(getAllMarkets, req, res, error)
    }
}

const getExchange = async (req, res) => {
    try {
        const { data } = await axios.get('exchanges')

        return res.status(200).json(data)
    } catch (error) {
        handleError(getExchange, req, res, error)
    }
}


const getFutureMarkets = async (req, res) => {
    try {
        const { data } = await axios.get('ohlcv-history', {
            params: req.query
        })

        return res.status(200).json(data)
    } catch (error) {
        handleError(getFutureMarkets, req, res, error)
    }
}


const getLiquidation = async (req, res) => {
    try {
        const { data } = await axios.get('liquidation-history', {
            params: req.query
        })

        return res.status(200).json(data)
    } catch (error) {
        handleError(getLiquidation, req, res, error)
    }
}

module.exports = {
    getAllMarkets,
    getFutureMarkets,
    getLiquidation,
    getExchange,
}
