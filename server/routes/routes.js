const router = require('express').Router();
const Model = require('../../database/models/model.js')
const user = require('../controller/userController.js');
const stock = require('../controller/stockController.js');
const portfolio = require('../controller/portfolioController.js');
const portfolioStock = require('../controller/portfolioStockController.js');
const transactionController = require('../controller/transactionController.jsx');
const leaderboard = require('../controller/leaderboardController.js');
const auth = require('../controller/authenticateController.js');

const axios = require('axios');
const xmlParser = require('xml2json');
//////// AUTH

router.get('/getToken', auth.getToken);

/////////



router.get('/coinQuery', portfolioStock.coinQuery);

router.get('/login', user.login);
router.post('/signup', user.signup);
router.get('/isOwnerOfPortfolio', auth.authenticate, portfolio.isOwnerOfPortfolio);

router.get('/getUserData', auth.authenticate, portfolioStock.getUserData);
router.get('/getSpecificPortfolio', auth.authenticate, portfolio.getSpecificPortfolio);
router.delete('/deletePortfolio', auth.authenticate, portfolio.deletePortfolio);

router.post('/buy', auth.authenticate, portfolioStock.buy);
router.put('/sell', auth.authenticate, portfolioStock.sell);
router.delete('/sellAll', auth.authenticate, portfolioStock.sellAll);

router.post('/createPortfolio', auth.authenticate, portfolio.createPortfolio);
router.get('/getPortfolioHistory', portfolio.getPortfolioHistory);


router.get('/portfolioTransactionHistory', transactionController.portfolioHistory);
router.get('/fetchSpecificLeaderboard', leaderboard.fetchLeaderboard);

router.get('/getNewsFeed', function(req, res) {
  let urls = {
    btc: 'https://www.google.com/alerts/feeds/09786470827379239761/3670693558918612812',
    bch: 'https://www.google.com/alerts/feeds/09786470827379239761/3670693558918612812',
    eth: 'https://www.google.com/alerts/feeds/09786470827379239761/15529768159353373328',
    ltc: 'https://www.google.com/alerts/feeds/09786470827379239761/5927708691400587615',
    xmr: 'https://www.google.com/alerts/feeds/09786470827379239761/1581829545819236887',
    xrp: 'https://www.google.com/alerts/feeds/09786470827379239761/9116263399951559675',
    zec: 'https://www.google.com/alerts/feeds/09786470827379239761/14531541400846783339'
  }
  let chosenCurrency = urls[req.query[0]]
  axios.get(chosenCurrency)
      .then(data => {
        let JSONdata = xmlParser.toJson(data.data.toString())
        res.send(JSONdata)
      })
      .catch(err => {
        console.log('ERROR parsing xml data from Google ::: ', err)
      })
})

router.get('/getHistoricalCurrencyData', stock.getHistoricalData);

router.get('/getPrediction', auth.authenticate, stock.getPredictionData)

module.exports = router;
