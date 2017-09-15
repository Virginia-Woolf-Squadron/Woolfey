import React from 'react'
import axios from 'axios'

export default class PortfolioLandingCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      portfolioValue: 0,
      stockValues: {},
      portfolioCash: 0,
      renderCard: false
    }
    this.calculatePortfolioValue = this.calculatePortfolioValue.bind(this)
    this.isEmpty = this.isEmpty.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    this.calculatePortfolioValue(this.props.item.stocks)
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  handleClick() {
    this.props.modalClick ? this.props.modalClick(this.props.item.id, this.props.item.balance, this.props.item.name) : null
  }

  calculatePortfolioValue(currencyArr) {
    let tempVal = 0
    let count = 0

    if (this.isEmpty(currencyArr)) {
      this.setState({ portfolioValue: this.props.item.balance,
                        portfolioCash: this.props.item.balance })
    } else {
      currencyArr.forEach((x, i) => {
        axios.get('/api/coinQuery', {params: x.ticker})
          .then(reply => {
            let price = Number(parseFloat(reply.data).toFixed(2));
            price *= x.shares;
            this.state.stockValues[x.ticker] = price;
            tempVal += price;
            count++;
            if (count === currencyArr.length) {
              let newValue = (tempVal + this.props.item.balance).toFixed(2)
              this.setState({
                portfolioValue: newValue,
                stockValues: this.state.stockValues,
                portfolioCash: Math.round(this.props.item.balance * 100) / 100,
                renderCard: true
              })
            }
          })
      })
    }
  }

  render() {
    return (

      <div>

        {this.state.renderCard ?

          <button className='btn btn-default btn-lg port-list-btn' onClick={this.handleClick}>
            <h3>{this.props.item.name}</h3>
            <p>Portfolio value: ${this.state.portfolioValue}</p>
            <p>Cash: ${this.state.portfolioCash}</p>
          </button>

          :
          
          <div className='loader'></div>

        }

      </div>

    )
  }
}