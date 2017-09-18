const Model = require('../../database/models/model.js');
const Redis = require('../../database/redis/redis.js');

module.exports ={
  createPortfolio: (req, res) => {
    Model.Portfolio.create({
      name: req.body.name,
      userId: req.token.id
    })
    .then(portfolio => {
      Redis.hmset(`portfolio:${portfolio.dataValues.id}:hash`, ['liquid', portfolio.dataValues.balance, 'total', portfolio.dataValues.balance]);
      Redis.zadd('leaderboard', portfolio.dataValues.balance, portfolio.dataValues.id);
      res.send(portfolio);
    })
  },
  getSpecificPortfolio: (req, res) => {
    Model.Portfolio.findOne({where: {id: req.query.id}})
    .then(reply => {   
      Model.PortfolioStock.findAll({where: {portfolioId: reply.dataValues.id}})
      .then(stocksData => {
        let stocks = stocksData.map(x => x.dataValues);
        let response = reply.dataValues;
        response.stocks = stocks;
        if(!req.query.simple){
          Redis.zrank('leaderboard', req.query.id, (err, rank) => {
            Redis.zcard('leaderboard', (err, card) => {
              response.portfolioRank = card - rank;
              response.totalPortfolios = card;
              res.send(response);
            })
          });
        } else {
          res.send(response);
        }
      })
    })
  },
  getPortfolioHistory: (req, res) => {
    Model.PortfolioHistory.findAll({where: {portfolio_id: req.query.id}})
    .then(reply => {
      res.send(reply)
    })
  },
  deletePortfolio: (req, res) => {
    Model.PortfolioStock.findAll({where:{portfolioId: req.query.portfolioId}})
    .then(reply => {
      const portfolios = reply.map(x => x.dataValues);
      portfolios.forEach(x => Redis.srem(`${x.ticker}:members`, req.query.portfolioId));
      Model.Portfolio.destroy({
        where: {id: req.query.portfolioId}
      })
      .then(reply => {
        Model.PortfolioHistory.destroy({where: {portfolio_id: req.query.portfolioId}});
        Redis.del(`portfolio:${req.query.portfolioId}:hash`);
        Redis.zrem('leaderboard', req.query.portfolioId);
        res.json(reply)
      })
    })
  },
  isOwnerOfPortfolio: (req, res) => {
    Model.Portfolio.findOne({where: {userId: req.token.id, id: req.query.portfolioId}})
    .then(reply => {
      if(reply){
        res.json(true);
      } else {
        res.json(false);
      }
    })
  } 
}

