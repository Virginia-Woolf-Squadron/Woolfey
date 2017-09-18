const Model = require('../../database/models/model.js');
const db = require('../../database/index.js');
const Redis = require('../../database/redis/redis.js');
const axios = require('axios');

module.exports = {
coinQuery: (req, res) => {
  Redis.get(`${req.query[0]}:price`, (err, data) => {
    res.send(data);
  });
},
buy: (req, res) => {
  Model.PortfolioStock.findOne({where:{ticker: req.body.ticker, portfolioId: req.body.portfolioId}})
  .then(stockData => {
    if(stockData){
      let newStockValue = Math.round(Number(stockData.dataValues.shares) + Number(req.body.shares) * req.body.buyPrice * 100) / 100;
      Redis.hmget(`portfolio:${req.body.portfolioId}:hash`, 'total', `${req.body.ticker}:amount`, 'liquid', (err, data) => {
        if(data){

          Redis.hmset(`portfolio:${req.body.portfolioId}:hash`, `${req.body.ticker}:shares`, stockData.dataValues.shares + req.body.shares, `${req.body.ticker}:amount`, newStockValue, 'total', data[0] - data[1] + newStockValue, 'liquid', Math.round((Number(data[2]) - req.body.finalPrice)*100)/100);
        } else {
          console.log('Redis error', req.body.portfolioId)
        }
      })
      db.query(`UPDATE portfolio_stocks SET shares = shares + ${req.body.shares} WHERE id = ${stockData.dataValues.id}`)
      .then(() => {
        db.query(`UPDATE portfolios SET balance = balance - ${req.body.finalPrice} WHERE id = ${req.body.portfolioId}`)
        .then(() => {
          Model.TransactionHistory.create({
            ticker: req.body.ticker,
            shares: req.body.shares,
            transactionType: 'buy',
            transactionPrice: req.body.buyPrice,
            transactionTotal: req.body.finalPrice,
            portfolioId: req.body.portfolioId,
            createdAt: Date.now()
          })
          .then(() => {
            stockData.dataValues.shares = Number(stockData.dataValues.shares) + Number(req.body.shares);
            res.json(stockData.dataValues)
          })
          .catch((err) => console.log(err, 'error'))
        });
      })
    } else {
        Redis.hget(`portfolio:${req.body.portfolioId}:hash`, 'total', 'liquid', (err, data) => {
          if(data){
            Redis.hmset(`portfolio:${req.body.portfolioId}:hash`, `${req.body.ticker}:shares`, req.body.shares, `${req.body.ticker}:amount`, req.body.finalPrice,'liquid', Math.round((Number(data[1]) - req.body.finalPrice) * 1000) / 1000,'total', Number(data[0]) + Number(req.body.finalPrice));
          } else {
            console.log('Redis error', req.body.portfolioId)
          }
        });
        Model.PortfolioStock.create({
          portfolioId: req.body.portfolioId,
          buyPrice: req.body.buyPrice,
          shares: req.body.shares,
          ticker: req.body.ticker
        })
        .then(stock => {
          Redis.sadd(`${req.body.ticker}:members`, req.body.portfolioId);
          db.query(`UPDATE portfolios SET balance = balance - ${req.body.finalPrice} WHERE id = ${req.body.portfolioId}`)
          .then(() => {
              Model.TransactionHistory.create({
                ticker: req.body.ticker,
                shares: req.body.shares,
                transactionType: 'buy',
                transactionPrice: req.body.buyPrice,
                transactionTotal: req.body.finalPrice,
                portfolioId: req.body.portfolioId,
                createdAt: Date.now()
              })
              .then(() => res.json(stock.dataValues));
          });
        })
      }
  })
  .catch(err => res.status(400).send('Error adding stock to portfolio'))
},
getUserData: (req, res) => {
  Model.Portfolio.findAll({
    where: {userId: req.token.id}
  })
  .then(portfolios => {
    Promise.all(portfolios.map(folder => Model.PortfolioStock.findAll({where: {portfolioId: folder.id}})))
    .then(results => {
      let stocks = results.map(x=>x.map(y => y.dataValues));
      let portfolioData = portfolios.map(x => x.dataValues);
      portfolioData.forEach((x,i) => portfolioData[i].stocks = stocks[i]);
      res.json(portfolioData);
    })
  })
},

///////////////////////////// SELL ////////////////////////////

sell: (req, res) => {
  let query = req.query;
  Model.PortfolioStock.findOne({where:{ticker: query.ticker, portfolioId: query.portfolioId}})
  .then(stockData => {
    if(stockData) {
      Redis.hmget(`portfolio:${query.portfolioId}:hash`, 'total', `${query.ticker}:amount`, `${query.ticker}:shares`, (err, data) => {
        Redis.hmset(`portfolio:${query.portfolioId}:hash`, 'total', data[0], `${query.ticker}:amount`, data[1] - query.finalPrice,`${query.ticker}:shares`, data[2] - query.shares)
      })
      db.query(`UPDATE portfolio_stocks SET shares = shares - ${query.shares} WHERE id = ${stockData.dataValues.id}`)
      .then(() => {
        db.query(`UPDATE portfolios SET balance = balance + ${query.finalPrice} WHERE id = ${query.portfolioId}`)
        .then(() => {
          Model.TransactionHistory.create({
            ticker: query.ticker,
            shares: query.shares,
            transactionType: 'sell',
            transactionPrice: query.sellPrice,
            transactionTotal: query.finalPrice,
            portfolioId: query.portfolioId,
            createdAt: Date.now()
          })
          .then(() => {
            stockData.dataValues.shares = Number(stockData.dataValues.shares) - Number(query.shares);
            res.json(stockData.dataValues);
          })
        })
        .catch(() => res.send('error selling'))
      })
    } else {
      res.send(`do not own`);
    }
  })
},
sellAll: (req, res) => {
  let query = req.query;
  Model.PortfolioStock.destroy({
    where: {ticker: query.ticker, portfolioId: query.portfolioId}
  })
  .then(() => {
    Redis.hmget(`portfolio:${query.portfolioId}:hash`, `total`, `${query.ticker}:amount`, (err, data) => {
      Redis.hdel(`portfolio:${query.portfolioId}:hash`, `${query.ticker}:shares`);
      Redis.hdel(`portfolio:${query.portfolioId}:hash`, `${query.ticker}:amount`);
      Redis.hincrbyfloat(`portfolio:${query.portfolioId}:hash`, `total`, query.finalPrice - data[1]);
    })
    Redis.srem(`${query.ticker}:members`, query.portfolioId);
    db.query(`update portfolios SET balance = balance + ${query.finalPrice} WHERE id = ${query.portfolioId}`)
    .then(() => {
      Model.TransactionHistory.create({
        ticker: query.ticker,
        shares: query.shares,
        transactionType: 'sell',
        transactionPrice: query.sellPrice,
        transactionTotal: query.finalPrice,
        portfolioId: query.portfolioId,
        createdAt: Date.now()
      })
      .then(() => res.send('sucessfully sold'))
    })
  })
}

}