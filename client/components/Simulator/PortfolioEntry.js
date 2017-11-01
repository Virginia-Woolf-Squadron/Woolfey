import React from 'react'

export default class PortfolioEntry extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      stockValue: this.props.stockValues[this.props.item.ticker],
      origValue: this.props.origValues[this.props.item.ticker],
      sellValue: this.props.sellValues[this.props.item.ticker],
      stockReturn: 0,
      mixValue: ((parseFloat(props.stockValues[this.props.item.ticker]) / parseFloat(props.portfolioValue)) * 100).toFixed(2)
    }
    this.getCurrencyName = this.getCurrencyName.bind(this)
    this.calculateCurrencyReturn = this.calculateCurrencyReturn.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      stockValue: nextProps.stockValues[nextProps.item.ticker].toFixed(2)
    })
  }

  componentDidMount() {
    this.calculateCurrencyReturn()
  }

  getCurrencyName(ticker) {
    switch (ticker) {
      case ('btc'):
        return 'Bitcoin'
      case ('bch'):
        return 'Bitcoin Cash'
      case ('ltc'):
        return 'Litecoin'
      case ('eth'):
        return 'Ethereum'
      case ('xrp'):
        return 'Ripple'
      case ('xmr'):
        return 'Monero'
    }
  }

  calculateCurrencyReturn() {
    let stockReturn = this.props.item.shares === 0 ? 0 :
    (((this.state.stockValue + this.state.sellValue) - this.state.origValue) / this.state.origValue*100).toFixed(2)

    this.setState({ stockReturn })
  }

  render() {

    let totReturn = this.state.stockReturn
    let stockReturn = totReturn > 0 ? <td className="posReturn">{totReturn}%</td> :
                      totReturn < 0 ? <td className="negReturn">{totReturn}%</td> :
                      <td>{totReturn}%</td>


    return (
      <tr>
        <td>{this.getCurrencyName(this.props.item.ticker)} ({this.props.item.ticker.toUpperCase()})</td>
        {/* <td>{this.props.item.ticker.toUpperCase()} </td> */}
        <td>{Math.round(this.props.item.shares * 1000) / 1000} </td>
        <td>${this.state.stockValue} </td>
        <td>{isNaN(this.state.mixValue) ? '0.00' :  ((parseFloat(this.props.stockValues[this.props.item.ticker]) / parseFloat(this.props.portfolioValue)) * 100).toFixed(2)}%</td>
        { stockReturn }
      </tr>
    )
  }
}