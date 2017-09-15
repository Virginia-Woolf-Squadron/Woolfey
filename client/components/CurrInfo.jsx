import React from 'react'
import axios from 'axios'
import Navigation from './Navbar.js'
import PortfolioLandingCard from './Simulator/PortfolioLandingCard.jsx'
import { Button, Modal } from 'react-bootstrap'
import {Link, Redirect} from 'react-router-dom'

export default class CurrInfo extends React.Component {
  constructor() {
    super()
    this.state = {
      currencyName: '',
      currentValue: '',
      articles: [],
      data: [],
      valueIncrease: true,
      valueChange: 0,
      showModal: false,
      portfolios: [],
      token: localStorage.getItem('token'),
      isLoggedIn: false,
      portfolio_id: 0,
      action: '',
      input: '',
      purchasePrice: '',
      portfolioBalance: '',
      portfolioName: '',
      stocks: [],
      predictions: [],
      chartCounter: 0
    }
    this.getNewsFeed = this.getNewsFeed.bind(this)
    this.getCurrencyPrice = this.getCurrencyPrice.bind(this)
    this.getHistoricalCurrencyData = this.getHistoricalCurrencyData.bind(this)
    this.createChart = this.createChart.bind(this)
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleFetchData = this.handleFetchData.bind(this)
    this.modalClick = this.modalClick.bind(this)
    this.handleBuy = this.handleBuy.bind(this)
    this.handleSell = this.handleSell.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmitPriceCheck = this.handleSubmitPriceCheck.bind(this)
    this.handleAddStock = this.handleAddStock.bind(this)
    this.handleSellStock = this.handleSellStock.bind(this)
    this.sellAll = this.sellAll.bind(this)
    this.handleArticleClick = this.handleArticleClick.bind(this)
    this.getPredictionData = this.getPredictionData.bind(this)
    this.handleLogOut = this.handleLogOut.bind(this)
    this.counter = this.counter.bind(this)
  }

  componentDidMount() {
    this.setState({
      currencyName: decodeURI(window.location.pathname.slice(10))
    }, () => {
      axios.all([this.getCurrencyPrice(), this.getHistoricalCurrencyData()])
      .then(axios.spread((price, history) => {
        let currentValue = '$' + String(parseFloat(price.data).toFixed(2))
        let valuePercentChange = ((parseFloat(price.data).toFixed(2) - history.data[history.data.length - 2][1]) / history.data[history.data.length - 2][1]) * 100
        valuePercentChange = valuePercentChange.toFixed(2)
        if (parseFloat(price.data).toFixed(2) > history.data[history.data.length - 2][1]) {
          this.setState({
            valueIncrease: true,
            valueChange: valuePercentChange
          })
        } else {
          this.setState({
            valueIncrease: false,
            valueChange: valuePercentChange
          })
        }
        this.setState({ currentValue }, () => {
          let data = history.data
          this.setState({ data }, () => {
            this.counter()
          })
        })
      }))
      this.getPredictionData()
    })
    this.getNewsFeed()
    this.handleFetchData()
  }

  handleFetchData(){
    axios.get('/api/getUserData', {headers: {authorization:this.state.token}})
    .then(reply => this.setState({portfolios: reply.data,
                                  isLoggedIn: true}))
    .catch(err => console.log(err, 'error'))
  }

  counter() {
    this.state.chartCounter++;
    if(this.state.chartCounter === 2){
      this.createChart();
    }
  }

  getPredictionData() {
    axios({
      method: 'get',
      url: '/api/getPrediction',
      headers: {authorization: this.state.token},
      params: {currency: this.state.currencyName}
    })
    .then(reply => {
      if(reply.data.prediction){

        let data = JSON.parse(reply.data.prediction)
        let predictions = []
        for (var key in data.ds) {
          predictions.push([Date.parse(data.ds[key]), data.yhat[key]])
        }
        this.setState({ predictions }, () => { 
          this.state.chartCounter += 1
          if (this.state.chartCounter === 2) {
            this.createChart()
          }
        })
      } else {
        this.counter()
      }
    })
    .catch(err => {
      this.counter()
    })
  }

  handleBuy() {
    this.open()
    this.setState({ action: 'Buy' })
  }

  handleSell() {
    this.open()
    this.setState({ action: 'Sell' })
  }

  close() {
    this.setState({ showModal: false })
  }

  open() {
    this.setState({ showModal: true })
  }

  handleInputChange(e) {
    this.setState({
        input: e.target.value
    }, () => {this.handleSubmitPriceCheck()})
  }

  handleSubmitPriceCheck(e) {
    let tempPrice = parseFloat(parseFloat(this.state.currentValue.slice(1))) * parseFloat(this.state.input);
    this.setState({
      purchasePrice: tempPrice.toFixed(2)
    })
  }

  handleSubmit() {
    if (this.state.action === 'Buy') {
      this.handleAddStock()
    } else if (this.state.action === 'Sell') {
      this.handleSellStock()
    }
    this.close()
  }

  modalClick(id, balance, name) {
    this.setState({ portfolio_id: id,
                    portfolioBalance: balance,
                    portfolioName: name},
    
    () => {
      axios({
        method: 'get',
        url: '/api/getSpecificPortfolio',
        headers: {authorization: this.state.token},
        params: {id: this.state.portfolio_id}
      })
      .then(reply => {
        this.setState({
          stocks: reply.data.stocks
        })
      })
      .catch(err => console.log(err, 'error'))
    })
  }

  getCurrencyPrice() {
    return axios.get('/api/coinQuery', {params: this.state.currencyName})
  }

  getHistoricalCurrencyData() {
    return axios.get('/api/getHistoricalCurrencyData', {params: this.state.currencyName})
  }
    
  createChart() {
    Highcharts.theme = {
      colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
          '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
      chart: {
          backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
                [0, '#2a2a2b'],
                [1, '#3e3e40']
            ]
          },
          style: {
            //fontFamily: '\'Unica One\', sans-serif'
            borderRadius: '10px'
          },
          plotBorderColor: '#606063'
      },
      title: {
          style: {
            color: '#E0E0E3',
            fontSize: '20px'
          },
      },
      subtitle: {
          style: {
            color: '#E0E0E3',
            textTransform: 'uppercase'
          }
      },
      xAxis: {
          gridLineColor: '#707073',
          labels: {
            style: {
                color: '#E0E0E3'
            }
          },
          lineColor: '#707073',
          minorGridLineColor: '#505053',
          tickColor: '#707073',
          title: {
            style: {
                color: '#A0A0A3'
            }
          }
      },
      yAxis: {
          gridLineColor: '#707073',
          labels: {
            style: {
                color: '#E0E0E3'
            }
          },
          lineColor: '#707073',
          minorGridLineColor: '#505053',
          tickColor: '#707073',
          tickWidth: 1,
          title: {
            style: {
                color: '#A0A0A3'
            }
          }
      },
      tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          style: {
            color: '#F0F0F0'
          }
      },
      plotOptions: {
          series: {
            dataLabels: {
                color: '#B0B0B3'
            },
            marker: {
                lineColor: '#333'
            }
          },
          boxplot: {
            fillColor: '#505053'
          },
          candlestick: {
            lineColor: 'white'
          },
          errorbar: {
            color: 'white'
          }
      },
      legend: {
          itemStyle: {
            color: '#E0E0E3'
          },
          itemHoverStyle: {
            color: '#FFF'
          },
          itemHiddenStyle: {
            color: '#606063'
          }
      },
      credits: {
          style: {
            color: '#666'
          }
      },
      labels: {
          style: {
            color: '#707073'
          }
      },
      drilldown: {
          activeAxisLabelStyle: {
            color: '#F0F0F3'
          },
          activeDataLabelStyle: {
            color: '#F0F0F3'
          }
      },
      navigation: {
          buttonOptions: {
            symbolStroke: '#DDDDDD',
            theme: {
                fill: '#505053'
            }
          }
      },
      // scroll charts
      rangeSelector: {
          buttonTheme: {
            fill: '#505053',
            stroke: '#000000',
            style: {
                color: '#CCC'
            },
            states: {
                hover: {
                  fill: '#707073',
                  stroke: '#000000',
                  style: {
                      color: 'white'
                  }
                },
                select: {
                  fill: '#000003',
                  stroke: '#000000',
                  style: {
                      color: 'white'
                  }
                }
            }
          },
          inputBoxBorderColor: '#505053',
          inputStyle: {
            backgroundColor: '#333',
            color: 'silver'
          },
          labelStyle: {
            color: 'silver'
          }
      },
      navigator: {
          handles: {
            backgroundColor: '#666',
            borderColor: '#AAA'
          },
          outlineColor: '#CCC',
          maskFill: 'rgba(255,255,255,0.1)',
          series: {
            color: '#7798BF',
            lineColor: '#A6C7ED'
          },
          xAxis: {
            gridLineColor: '#505053'
          }
      },
      scrollbar: {
          barBackgroundColor: '#808083',
          barBorderColor: '#808083',
          buttonArrowColor: '#CCC',
          buttonBackgroundColor: '#606063',
          buttonBorderColor: '#606063',
          rifleColor: '#FFF',
          trackBackgroundColor: '#404043',
          trackBorderColor: '#404043'
      },
      // special colors for some of the
      legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
      background2: '#505053',
      dataLabelsColor: '#B0B0B3',
      textColor: '#C0C0C0',
      contrastTextColor: '#F0F0F3',
      maskColor: 'rgba(255,255,255,0.3)'
    };
    Highcharts.setOptions(Highcharts.theme);
    Highcharts.stockChart('container', {
      legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle'
      },
      rangeSelector: {
          selected: 4
      },
      navigator: {
        enabled: true
      },
      title: {
          text: this.state.currencyName.toUpperCase()
      },
      plotOptions: {
        series: {
          showInNavigator: true,
          cursor: 'pointer',
          point: {
            events: {
              click: function(e){
              }
            }
          }
        }
      },
      tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
        valueDecimals: 2,
        split: true
      },
      series: [{
        name: 'actual',
        data: this.state.data,
        color: '#42cef4'
      },
    
      {
        name: 'predicted',
        data: this.state.predictions ? this.state.predictions : [],
        color: '#ff8100'
      }]
    })
  }


  getNewsFeed() {
    axios.get('/api/getNewsFeed', {params: decodeURI(window.location.pathname.slice(10))})
      .then(data => {
        var regex = /(<([^>]+)>)/ig
        let tempArr = []
        for (let i = 0; i < data.data.feed.entry.length; i++) {
          var body = data.data.feed.entry[i].title.$t
          var result = body.replace(regex, "")
          var result2 = result.replace(/&#39;/g, "'")
          tempArr.push([result2, data.data.feed.entry[i].link.href])
        }
        this.setState({
          articles: tempArr
        })
       })
  }

  handleAddStock(){
    if (confirm(`Buy ${this.state.input} shares of ${this.state.currencyName.toUpperCase()} for $${this.state.purchasePrice}?`)) {
      let finalPrice = this.state.purchasePrice
      if(this.state.purchasePrice < this.state.portfolioBalance){
        let buyObj = {
          shares: this.state.input,
          buyPrice: parseFloat(this.state.currentValue.slice(1)),
          ticker: this.state.currencyName,
          portfolioId: this.state.portfolio_id,
          finalPrice
        }
        axios.post('/api/buy', buyObj, {headers: {authorization:this.state.token}})
        .then(reply => {
          this.setState({
            input: '',
            purchasePrice: ''
          }, () => { alert('Success!') })
        });
      } else {
        alert('Insufficient Funds');
      }
    }
  }
  
  handleSellStock(){
    if (confirm(`Sell ${this.state.input} shares of ${this.state.currencyName.toUpperCase()} for $${this.state.purchasePrice}?`)) {
      let finalPrice = this.state.purchasePrice
      let stockIndex = this.state.stocks.findIndex(x=>x.ticker === this.state.currencyName);

      if(stockIndex > -1){
        let sellObj = {
          shares: this.state.input,
          sellPrice: parseFloat(this.state.currentValue.slice(1)),
          ticker: this.state.currencyName,
          portfolioId: this.state.portfolio_id,
          finalPrice
        }
        if(Math.abs(this.state.stocks[stockIndex].shares - this.state.input) < .2){
          this.sellAll(sellObj);
        } else if(this.state.stocks[stockIndex].shares > this.state.input){
          axios({
            method: 'put',
            url: '/api/sell',
            headers: {authorization: this.state.token},
            params: sellObj
          })
          .then(reply => {
            if(reply.data !== 'do not own'){    
              this.setState({
                input: '',
                purchasePrice: ''
              }, () => alert('Success!'))
            }
          })
        }
      }
    }
  }

  sellAll(sellObj){
    axios({
      method: 'delete',
      url: '/api/sellAll',
      headers: {authorization: this.state.token},
      params: sellObj
    })
    .then(reply => {
      this.setState({
        input: '',
        purchasePrice: ''
      })
    })
  }
  handleArticleClick(e, article){
    
    let newsArticle = article[1].slice(42);
    const re = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;

    if(confirm(`You are leaving Woolfey and going to ${re.exec(newsArticle)[1]}`)){
      window.location = article[1];
    }
  }
  
  handleLogOut(){
    localStorage.removeItem('token')
    this.setState({
      loggedIn: false
    })
  }

  render() {

    var highchartStyle = {
      height: '400px',
      maxWidth: '100%',
      midWidth: '310px',
      margin: '10px auto'
    }

    var buttonStyle = {
      marginTop: '20px'
    }

    var spanStyle = {
      fontSize: '1.3em'
    }

    let displayPurchasePrice = this.state.purchasePrice && this.state.purchasePrice !== 'NaN' ? <span style={spanStyle}>  x  {this.state.currentValue}  =  {`$${this.state.purchasePrice}`}</span> : null

    return (
      <div className='container'>
        <Navigation handleLogOut={this.handleLogOut} loggedIn={this.state.isLoggedIn}/>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.action} {this.state.currencyName.toUpperCase()} - Choose portfolio</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmitPriceCheck}>
              <input type='text' maxLength="7" className='text-center currBuyInput' placeholder='Enter amount' onChange={this.handleInputChange} />
              { displayPurchasePrice }
            </form>

            <br/>

            <div className="container">
              <div className="row">
                {this.state.portfolios.map((item, index) => (
                  <div className="port-list-modal" key={index}>
                    <PortfolioLandingCard item={item} modalClick={this.modalClick} />
                  </div> 
                ))}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleSubmit}>{this.state.action}</Button>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
        
        {this.state.currentValue !== '' ?
        <div className="currInfo">
          <div className='row'>
            <div className='col-xs-4 col-xs-offset-2 curr-info-price'>
              <h1>{this.state.currencyName.toUpperCase()} - {this.state.currentValue}</h1>
              <p style={{ color: this.state.valueIncrease ? 'green' : 'red' }}><i className={this.state.valueIncrease ? "fa fa-arrow-up" : "fa fa-arrow-down"} aria-hidden="true"></i> {this.state.valueChange}% </p>
            </div>

              {this.state.isLoggedIn ? 

              <div className='col-xs-4 col-xs-offset-2'>
                <button className='btn btn-primary buy-btn' onClick={this.handleBuy} style={buttonStyle}>Buy</button>
                <button className='btn btn-danger sell-btn' onClick={this.handleSell} style={buttonStyle}>Sell</button>
              </div>

              :

              null

              }

          </div>
          <div className='row'>
            <div className='col-xs-10 col-xs-offset-1'>
              <div id='container' style={highchartStyle}></div>
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-10 col-xs-offset-1'>
              <h2>Recent News</h2>
              <ul>
                {this.state.articles.map((article, index) => 
                  <a key={index}  onClick={(e) => this.handleArticleClick(e, article)} className="newsArticle"><li>{article[0]}</li></a>
                )}
              </ul>
            </div>
          </div>
        </div>

          : 
          

        <div className='currency-loader'></div>

          }
      </div>
    )
  }
}