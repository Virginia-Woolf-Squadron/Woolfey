import React from 'react'
import PortfolioPage from './PortfolioPage'
import Signup from '../../Auth/Signup.jsx'
import Login from '../../Auth/Login.jsx'
import axios from 'axios'
import {Link} from 'react-router-dom'
import Auth from '../../Auth/Auth.jsx'
import Navigation from '../Navbar'
import { Button, Modal, Navbar } from 'react-bootstrap'
import PortfolioLandingCard from './PortfolioLandingCard.jsx'

export default class PortfolioLanding extends React.Component {
  constructor() {
    super()
    this.Auth = new Auth
    this.state = {
      portfolios: [],
      portfolioId: 0,
      token: localStorage.getItem('token'),
      loggedIn: false,
      showModal: false,
      name: '',
      seriesOptions: [],
      seriesCounter: 0,
      names: ['btc','bch','eth','ltc','xmr','xrp']
    }
    this.handleFetchData = this.handleFetchData.bind(this)
    this.createPort = this.createPort.bind(this)
    this.close = this.close.bind(this)
    this.open = this.open.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleSignUp = this.handleSignUp.bind(this)
    this.handleLogOut = this.handleLogOut.bind(this)
    this.createChart = this.createChart.bind(this)
    this.getChartData = this.getChartData.bind(this)
  }
  componentDidMount() {
    this.handleFetchData()
    this.getChartData()
  }
  handleSignUp(){
    this.setState({token: localStorage.getItem('token')})
  }
  handleLogin(){
    this.setState({token: localStorage.getItem('token')}, () => this.handleFetchData())
  }
  handleLogOut(){
    localStorage.removeItem('token')
    this.setState({
      loggedIn: false,
      portfolios: [],
      portfolioId: 0,
      name: ''
    })
  }
  handleFetchData(){
    axios.get('/api/getUserData', {headers: {authorization:this.state.token}})
    .then(reply => {
      this.setState({portfolios: reply.data, loggedIn: true});
      })
    .catch(err => console.log(err, ' fetch error error'))
  }

  createPort(name) {
    axios.post('/api/createPortfolio', { name }, {headers: {authorization:this.state.token}})
      .then(result => {
        let portfolios = this.state.portfolios
        portfolios.push(result.data)
        this.setState({ portfolios })
      })
      .catch(err => console.log(err))
  }

  close() {
    this.setState({ showModal: false })
  }

  open() {
    if(this.state.portfolios.length < 3) {
      this.setState({ showModal: true })
    } else {
      alert('Maximum portfolios for free tier')
    }
  }

  handleChange(e) {
    let temp = e.target.name
    this.setState({
      [temp]: e.target.value
    })
  }

  handleKeyPress(event) {
    if(event.key == 'Enter'){
      this.createPort(this.state.name)
      this.close()
    }
  }

  handleSubmit() {
    this.createPort(this.state.name)
    this.close()
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
      rangeSelector: {
        selected: 4
      },
      yAxis: {
        labels: {
          formatter: function () {
            return (this.value > 0 ? ' + ' : '') + this.value + '%';
          }
        },
        plotLines: [{
          value: 0,
          width: 2,
          color: 'silver'
        }]
      },
      plotOptions: {
        series: {
          compare: 'percent',
          showInNavigator: true
        }
      },
      title: {
        text: '% Change, Last 30 Days'
      },
      tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
        valueDecimals: 2,
        split: true
      },
      series: this.state.seriesOptions
    });
  }

  getChartData() {
    this.state.names.forEach((coin, i) => {
      axios.get('/api/getHistoricalCurrencyData', {params: coin})
      .then(reply => {
        let arr = reply.data
        this.state.seriesOptions[i] = {
          name: coin,
          data: arr.slice(arr.length - 30)
        };
        this.state.seriesCounter += 1;
        if (this.state.seriesCounter === this.state.names.length) {
          this.setState({ seriesOptions: this.state.seriesOptions }, () => { this.createChart() });
        }
      })
    })
  }
  
  render() {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-xs-12'>
            <div id="container" className="landingChart"></div>
          </div>
        </div>

        <Navigation handleLogOut={this.handleLogOut} loggedIn={this.state.loggedIn}/>

        <div className='row'>
          <div className="col-xs-4 col-xs-offset-4 text-center createPortBtn">
            <Button className="text-center portfolio-landing-responsive" bsStyle="primary" bsSize="large" onClick={this.open}>+ Create Portfolio</Button>
          </div>
        </div>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Create portfolio</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Portfolio name:</h4>
            <input name="name" onChange={this.handleChange} onKeyPress={this.handleKeyPress} type="text" size="30"/>
            <br/>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleSubmit}>Submit</Button>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>

        <div className="row">
          {this.state.portfolios.map((item, index) => (
            <Link key={index} to={{pathname:`/simulator/${item.id}`, state: this.state.portfolios}} >
              <div className="col-xs-4 text-center port-list-div">
                <PortfolioLandingCard item={item} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }
}