import React, { Component } from 'react';

export default class TransactionHistoryEntry extends Component {
    constructor(props){
        super(props);
        this.state = {

        }
    }
 
    render() {
        const transaction = this.props.item

        return (
            <div className='row'>
              <div className='col-xs-2 col-xs-offset-1'>
                {transaction.ticker}
              </div>
              <div className='col-xs-2'>
                {transaction.transactionType}
              </div>
              <div className='col-xs-2'>
                {transaction.shares}
              </div>
              <div className='col-xs-2'>
                ${transaction.transactionPrice}
              </div>
              <div className='col-xs-3'>
                {this.props.timeHandler(Number(transaction.createdAt))}
              </div>
            </div>
        );
    }
}