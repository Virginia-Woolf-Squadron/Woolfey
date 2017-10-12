import React from 'react'
import axios from 'axios'
import PortfolioTable from './PortfolioTable.js'
import SimulatorPurchase from './SimulatorPurchase.jsx'
import TransactionModal from '../Profile/TransactionModal.jsx'
import {Button} from 'react-bootstrap'

export default class PortfolioInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      portfolioValue: 0,
      cash: 0,
      annualReturn: .01,
      portfolioID: decodeURI(window.location.pathname.slice(11)),
      portfolioName: '',
      history: [],
      portfolioRank: this.props.portfolioRank,
      totalPortfolios: this.props.totalPortfolios,
      showModal: false
    }
    this.handleTransactionModal = this.handleTransactionModal.bind(this)
    this.createGraph = this.createGraph.bind(this)
  }

  componentWillReceiveProps(nextProps) {

    this.setState({
      portfolioValue: nextProps.portfolioValue,
      cash: nextProps.cash,
      portfolioName: nextProps.portfolioName,
      annualReturn: nextProps.annualReturn,
      history: nextProps.history,
      portfolioRank: nextProps.portfolioRank,
      totalPortfolios: nextProps.totalPortfolios

    }, () => this.createGraph(this.state.history))
  }
  handleTransactionModal(){
    this.setState({showModal: true}, () => this.setState({showModal: false}))
  }

  createGraph(data) {
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
            }
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
    if (this.state.history) {
      Highcharts.stockChart('container', {
        rangeSelector: { 
          selected: 1 
        },
        title: { 
          text: 'Portfolio Performance' 
        },
        series: [{
          name: 'Value',
          data: data,
          tooltip: {
            valueDecimals: 2
          },
          color: '#42cef4'
        }]
      });
    }
  }

  render() {

    var highchartStyle = {
      height: '400px',
      maxWidth: '90%',
      margin: '10px auto',
      marginBottom: '60px'
    };
    return (
      <div>
        <div style={{'marginTop':'60px'}} className='row portfolio-top-mobile'>
          <div className='col-xs-12 col-sm-4 portfolioDetails'>
            <h2>{this.state.portfolioName} <span className='rank'>&nbsp; Ranked: {this.state.portfolioRank}</span></h2>
            <p>Portfolio Value: ${this.state.portfolioValue}</p>
            <p>Remaining Cash: ${Number(this.state.cash).toFixed(2)}</p>
            <p>Lifetime Return: {isNaN(this.state.annualReturn) ? 'Calculating...' : (Number(this.state.annualReturn) * 100).toFixed(2)}%</p>
            <Button bsSize="xsmall" onClick={this.handleTransactionModal}>Buy/Sell History</Button>
            <TransactionModal transactions={this.props.transactions} showModal={this.state.showModal} />
            <hr />
            <SimulatorPurchase successfulPurge = {this.props.successfulPurge} portfolioStocks={this.props.portfolio.stocks} 
              portfolioId ={this.props.portfolioId} portfolio = {this.props.portfolio} portfolioBalance={this.props.cash} 
              successfulBuy={this.props.successfulBuy} successfulSell={this.props.successfulSell} isOwner={this.props.isOwner} />
            
          </div>
          <div className='col-xs-12 col-sm-8'>
            <PortfolioTable portfolioStocks={this.props.portfolioStocks} stockValues={this.props.stockValues} 
              portfolioValue={this.props.portfolioValue} origValues={this.props.origValues} sellValues={this.props.sellValues}
            />
          </div>
        </div>

        <div className='row'>
          <div id="container" style={highchartStyle}></div>
        </div>

        <div>
          
        </div>
      </div>
    )
  }
}