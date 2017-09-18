const CronJob = require('cron').CronJob;
const Model = require('../../database/models/model.js');
const Redis = require('../../database/redis/redis.js') ;
const axios = require('axios');
const chunk = require('lodash.chunk');

const coins = ['btc', 'bch', 'eth', 'ltc', 'xmr', 'xrp', 'zec'];
let bool = true;


const coinSet = () => {
  axios.all(coins.map((coin, i) => axios.get(`https://api.bitfinex.com/v1/pubticker/${coin}usd`)))
  .then(axios.spread(function(...resp){
    resp.map(x => x.data).forEach((coin, i) => {
      Redis.set(`${coins[i]}:price`, coin.last_price, (err, data) => {
        Redis.get(`${coins[i]}:previous:price`, (err, oldData) => {
          if(err) {
            Redis.set(`${coins[i]}:previous:price}`, coin.last_price);
          }
          else if(Math.abs((coin.last_price - oldData)/oldData) > .1) {
            triggerLeaderboardCalculation(coins[i], coin.last_price);
            Redis.set(`${coins[i]}:previous:price`, coin.last_price);
          } 
        })  
      })
    });  
    if(bool){
      leaderboard();
      createSet();
      hourlyLeaderboard.start();
      dailyLeaderboard.start();
      bool = false;
    }
  }));
}

const fetchCoins = (cb) => {
  Promise.all(coins.map(coin => new Promise((resolve, reject) => {Redis.get(`${coin}:price`, (err, data) => {
    resolve(data);
  } )} )))
  .then(reply => {
    var coinObj = {};
    for(var i = 0; i < coins.length; i++){
      coinObj[coins[i]] = reply[i];
    }
    fetchPortfolios(coinObj, cb);
  });
}

const fetchPortfolios = (coins, cb) => {
  Model.Portfolio.findAll({})
  .then(results => {
    const portfolios = results.map(x=>x.dataValues);
    cb(coins, portfolios);
  })
}

const storePortfolioData = (coins, portfolios) => {
  let time = Date.now();
  addDailyHistoricalGraphData(coins);
  portfolios.forEach((portfolio, i) => {
    Model.PortfolioStock.findAll({where:{portfolioId:portfolio.id}})
    .then(reply => {
      const stocks = reply.map(x => x.dataValues);
      let currencyValue = 0;
      for(let i = 0; i < stocks.length; i++) {
        currencyValue += (coins[stocks[i].ticker] * stocks[i].shares);
      }
      Model.PortfolioHistory.create({
        portfolio_id: portfolio.id,
        balance: Math.round((currencyValue + portfolio.balance) * 100) / 100,
        entry_date: time
      })
    })
  });
}
/////////////////////////////////////////////////
const addDailyHistoricalGraphData = coins => {
  let date = Date.now();
  for(let key in coins){
    appendCoinHistoricalData(key, coins[key], date);
  }

}

const appendCoinHistoricalData = (coin, price, date) => {
  Model.historicalGraphData.findOne({where: {currency: coin}})
  .then(graph => {
    console.log(price, `
    
    
    appended to history!
    
    
    `)
    const newData = graph.dataValues.data;
    newData.push([date, Math.round(price * 100) / 100]);
    Model.historicalGraphData.update({data: newData}, {where: {currency: coin}})
  })
}

///////////////////////////// LEADERBOARD /////////////////////////////////////

const setCurrentLeaderboard = (coins,portfolios, cb) => {
  portfolios.forEach((portfolio, ind) => {
    Model.PortfolioStock.findAll({where:{portfolioId:portfolio.id}})
    .then(reply => {
      const stocks = reply.map(x => x.dataValues);
      let currencyValue = 0;
      const currencyArray = [];
      for(let i = 0; i < stocks.length; i++) {
        let stockVal = Math.round(coins[stocks[i].ticker] * stocks[i].shares * 100) / 100;
        currencyValue += stockVal;
        currencyArray.push(`${stocks[i].ticker}:shares`);
        currencyArray.push(stocks[i].shares);
        currencyArray.push(`${stocks[i].ticker}:amount`);
        currencyArray.push(stockVal);
      }
      const completeCurrencyArray = currencyArray.concat('liquid').concat(portfolio.balance).concat('total').concat(Math.round((currencyValue + portfolio.balance) * 100) / 100);

      Redis.hmset(`portfolio:${portfolio.id}:hash`, completeCurrencyArray);
      Redis.zadd('leaderboard', Math.round((currencyValue + portfolio.balance) * 100) / 100, portfolio.id);
    })
  });
}

const nonCurrentLeaderboardHandler = (boardCategory) => {
  fetchCoins((coins, portfolios) => {
    portfolios.forEach((portfolio, ind) => {
      Model.PortfolioStock.findAll({where:{portfolioId:portfolio.id}})
      .then(reply => {
        const stocks = reply.map(x => x.dataValues);
        let portfolioValue = 0;
        for(var i = 0; i < stocks.length; i++){
          portfolioValue += (coins[stocks[i].ticker] * stocks[i].shares);
        }
        portfolioValue += portfolio.balance;
        portfolioValue = Math.round(portfolioValue * 100) / 100;
        Redis.hget(`${boardCategory}:${portfolio.id}:setter`, 'total', (err, data) => {
          if(data){
            Redis.zadd(`${boardCategory}`, Math.round((portfolioValue - Number(data)) * 100) / 100, portfolio.id);
          }

          Redis.hset(`${boardCategory}:${portfolio.id}:setter`, 'total', portfolioValue);
        })
      })
    })
  })
}

const triggerLeaderboardCalculation = (ticker, newValue) => {
  Redis.smembers(`${ticker}:members`, (err, members) => {
    members.forEach(id => {
      Redis.hmget(`portfolio:${id}:hash`, `${ticker}:shares`, `${ticker}:amount`,'total', (err, data) => {   
        let newCurrencyValue = Math.round(Number(data[0]) * Number(data[1]) * 100) / 100;
        let newTotal = Math.round((Number(data[2]) - Number(data[1]) + newCurrencyValue) * 100) / 100;
        Redis.hmset(`portfolio:${data}:hash`, `${ticker}:amount`, newCurrencyValue, 'total', newTotal);
        Redis.zadd('leaderboard', newTotal, id);
      })
    })
  })
}

const createSet = () => {
  Model.Portfolio.findAll({})
  .then(reply => {
    const portfolios = reply.map(x=>x.dataValues);
    makeCurrencySet(portfolios);
  })
}

const makeCurrencySet = (portfolios) => {
  portfolios.forEach((portfolio, x) => {
    Model.PortfolioStock.findAll({where:{id:portfolio.id}})
    .then(reply => {
      const stocks = reply.map(x => x.dataValues);
      stocks.forEach((stock,i) => {
        Redis.sadd(`${stock.ticker}:members`, portfolio.id);
      })
    })
  })
}

const leaderboard = () => {
  fetchCoins(setCurrentLeaderboard);

}

////////////////////////////////////////////////////////////////////////////////

const getCoinsData = new CronJob({cronTime:'00 */2 * * * *', onTick: () => {coinSet()}, start: false,timeZone:'America/Los_Angeles', runOnInit: true});
const collectDailyPortfolioData = new CronJob({cronTime:'00 30 23 * * *', onTick: () => {fetchCoins(storePortfolioData)}, start: false, timeZone:'America/Los_Angeles', runOnInit: false});
const hourlyLeaderboard = new CronJob({cronTime: '00 00 * * * *', onTick: () => {nonCurrentLeaderboardHandler('hourlyLeaderboard')}, start: false, timeZone: 'America/Los_Angeles', runOnInit: true});
const dailyLeaderboard = new CronJob({cronTime: '00 00 */4 * * *', onTick: () => {nonCurrentLeaderboardHandler('dailyLeaderboard')}, start: false, timeZone: 'America/Los_Angeles', runOnInit: true});

getCoinsData.start();
collectDailyPortfolioData.start();
