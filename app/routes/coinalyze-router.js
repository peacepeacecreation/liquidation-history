const express = require('express')
const router = express.Router()
const { getFutureMarkets, getLiquidation, getAllMarkets, getExchange } = require('../controllers/coinalyze-controller')

router.get('/all-markets', getAllMarkets)
router.get('/get-exchange', getExchange)
router.get('/future-markets', getFutureMarkets)
router.get('/liquidation-history', getLiquidation)

module.exports = router
