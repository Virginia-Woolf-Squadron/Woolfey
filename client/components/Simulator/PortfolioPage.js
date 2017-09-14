import React from 'react'
import PortfolioInfo from './PortfolioInfo'
import PortfolioTable from './PortfolioTable'
import SimulatorPurchase from './SimulatorPurchase.jsx'
import Leaderboard from '../Leaderboard/Leaderboard.jsx'
import Navigation from '../Navbar'
import TransactionModal from '../Profile/TransactionModal.jsx'
import axios from 'axios'
import {Link} from 'react-router-dom'

export default class PortfolioPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      portfolioId: window.location.href.substr(window.location.href.lastIndexOf('/') + 1),
      portfolioValue: 'Calculating...',
      portfolio: {},
      portfolioRank: '',
      totalPortfolios: '',
      cash: 'Calculating...',
      portfolioName: '',
      stockValues: {},
      annualReturn: 'Calculating...',
      history: [],
      transactions: [],
      isOwner: false
    }
    this.checkForOwner = this.checkForOwner.bind(this)
    this.fetchPortfolioTransactions = this.fetchPortfolioTransactions.bind(this)
    this.handleFetchData = this.handleFetchData.bind(this)
    this.calculatePortfolioValue = this.calculatePortfolioValue.bind(this)
    this.successfulBuy = this.successfulBuy.bind(this)
    this.successfulSell = this.successfulSell.bind(this)
    this.handleLogOutAndRedirect = this.handleLogOutAndRedirect.bind(this)
    this.calculateReturn = this.calculateReturn.bind(this)
    this.getPortfolioHistory = this.getPortfolioHistory.bind(this)
    this.successfulPurge = this.successfulPurge.bind(this)
    this.appendTransactions = this.appendTransactions.bind(this)
    this.isEmpty = this.isEmpty.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    
  }
  componentDidMount() {
    this.checkForOwner()
    this.fetchPortfolioTransactions()
  }
  checkForOwner(){

    axios({
      method: 'get',
      url: '/api/isOwnerOfPortfolio',
      headers: {authorization: localStorage.getItem('token')},
      params: {portfolioId: this.state.portfolioId}
    })
    .then(reply => {
      this.setState({isOwner: reply.data}, () => {this.handleFetchData(); this.getPortfolioHistory()})
    })
  }

  fetchPortfolioTransactions(){
    axios({
      method: 'get',
      url:'/api/portfolioTransactionHistory',
      params: {portfolioId: this.state.portfolioId}
    })
    .then(reply => {
      this.setState({transactions: reply.data});
    })
    .catch(err => 'ERROR')
  }

  handleLogOutAndRedirect(){
    localStorage.removeItem('token');
  }

  fetchTransactionHistory(){
    axios({
      method: 'get',
      url:'/api/portfolioTransactionHistory', 
      headers: {authorization: localStorage.getItem('token')},
      params: {portfolioId: this.props.portfolioId}
    })
    .then(reply => {
      this.setState({transactions: reply.data});
    })
  }
  
  handleFetchData(){
    axios({
      method: 'get',
      url: '/api/getSpecificPortfolio',
      headers: {authorization: localStorage.getItem('token')},
      params: {id: this.state.portfolioId}
    })
    .then(reply => {
      this.setState({
      cash: reply.data.balance,
      portfolioName: reply.data.name,
      portfolioId: reply.data.id,
      totalPortfolios: reply.data.totalPortfolios,
      portfolioRank: reply.data.portfolioRank
    },() => {this.calculatePortfolioValue(reply.data.stocks, reply.data)})
    })
    .catch(err => console.log(err, 'error'))
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  calculatePortfolioValue(currencyArr, port) {
    
    let tempVal = 0
    let count = 0

    if (this.isEmpty(currencyArr)) {
      this.setState({ portfolioValue: this.state.cash, portfolio: port },
      () => this.calculateReturn())
    } else {
      currencyArr.forEach((x, i) => {
        axios.get('/api/coinQuery', {params: x.ticker})
          .then(reply => {
            let price = parseFloat(reply.data).toFixed(2)
            price *= x.shares
            this.state.stockValues[x.ticker] = price
            tempVal += price
            count++
            if (count === currencyArr.length) {
              let newValue = (tempVal + this.state.cash).toFixed(2);
              this.setState({
                portfolioValue: newValue,
                stockValues: this.state.stockValues,
                portfolio: port
              }, () => this.calculateReturn())
            }
          })
      })
    }
  }
  successfulBuy(cashChange, stockData, transPrice, shares){
    this.appendTransactions(stockData.ticker, shares, 'buy', transPrice, cashChange)
    let stocks = this.state.portfolio.stocks;
    let found = false;
    for(var i = 0; i < stocks.length; i++){
      if(stocks[i].ticker === stockData.ticker){
        stocks[i] = stockData;
        this.state.stockValues[stockData.ticker] = Number(this.state.stockValues[stockData.ticker]) + Number(cashChange);
        this.setState({
          portfolio: this.state.portfolio,
          stockValues: this.state.stockValues,
          cash: (Number(this.state.cash) - Number(cashChange)).toFixed(2)
        });
        found = true;
      }
    }
    if(!found){
      this.state.stockValues[stockData.ticker] = Number(cashChange);
      stocks.push(stockData);
      this.setState({
        portfolio: this.state.portfolio,
        cash: (Number(this.state.cash) - Number(cashChange)).toFixed(2),
        stockValues: this.state.stockValues
      })
    }
  }
  successfulSell(cashChange, stockData, transPrice, shares){
    this.appendTransactions(stockData.ticker, shares, 'sell', transPrice, cashChange)
    let stocks = this.state.portfolio.stocks;
    for(var i = 0; i < stocks.length; i++){
      if(stocks[i].ticker === stockData.ticker){
        stocks[i] = stockData;
        this.state.stockValues[stockData.ticker] = Math.round((Number(this.state.stockValues[stockData.ticker]) - Number(cashChange)) * 100)/100;

        this.setState({
          portfolio: this.state.portfolio,
          stockValues: this.state.stockValues,
          cash: (Number(this.state.cash) + Number(cashChange)).toFixed(2)
        });
      }
    }
  }
  successfulPurge(cashChange, ticker, transPrice, shares){
    let stocks = this.state.portfolio.stocks;
    this.appendTransactions(ticker, shares, 'sell', transPrice, cashChange)
    for(var i = 0; i < stocks.length; i++){
      if(stocks[i].ticker === ticker){
        stocks.splice(i,1);
        delete this.state.stockValues[ticker];
        this.setState({
          portfolio: this.state.portfolio,
          stockValues: this.state.stockValues,
          cash: (Number(this.state.cash) + Number(cashChange)).toFixed(2)
        });
      }
    }
  }
  appendTransactions(ticker, shares, transactionType, transactionPrice, transactionTotal){
    const newTransaction = {
      ticker,
      shares,
      transactionType,
      transactionPrice,
      transactionTotal,
      createdAt: Date.now()
    }
    this.state.transactions.unshift(newTransaction);
    this.setState({ transactions: this.state.transactions });
  }
  handleDelete(){
    if(confirm('Are you sure you want to delete this portfolio?')){

      axios({
        method:'delete',
        url: '/api/deletePortfolio',
        headers: {authorization: localStorage.getItem('token')},
        params: {portfolioId: this.state.portfolioId}
      })
      .then(() => {
        window.location = '/';
      })
    }
  }

  calculateReturn() {
    let annualReturn = (this.state.portfolioValue - 100000)/100000;
    this.setState({ annualReturn })
  }

  getPortfolioHistory() {
    axios({
      method: 'get',
      url: '/api/getPortfolioHistory',
      headers: {authorization: localStorage.getItem('token')},
      params: {id: this.state.portfolioId}
    })
    .then(reply => {
      let history = []
      reply.data.forEach(item => {
        let date = new Date(item.entry_date.slice(0,10)).getTime()
        history.push([date, item.balance])
      })
      this.setState({ history })
    })
    .catch(err => console.log(err, 'error'))
  }

  render() {
    return (
      <div className='container' id='portPage'>
        <Navigation handleLogOut={this.handleLogOutAndRedirect} loggedIn={true} handleDelete={this.handleDelete}/> 
 
        <PortfolioInfo totalPortfolios={this.state.totalPortfolios} portfolioRank={this.state.portfolioRank} portfolioStocks={this.state.portfolio.stocks} stockValues={this.state.stockValues} history={this.state.history} 
          portfolioValue={this.state.portfolioValue} cash={this.state.cash} portfolioName={this.state.portfolioName} 
          annualReturn={this.state.annualReturn} portfolioId ={this.state.portfolioId} portfolio = {this.state.portfolio} 
          portfolioBalance={this.state.cash} successfulBuy={this.successfulBuy} successfulSell={this.successfulSell}
          successfulPurge={this.successfulPurge} isOwner={this.state.isOwner} transactions = {this.state.transactions}
        />
       
        
      </div>
    )
  }
}