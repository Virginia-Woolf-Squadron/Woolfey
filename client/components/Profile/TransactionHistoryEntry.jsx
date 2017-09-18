import React, { Component } from 'react';

export default class TransactionHistoryEntry extends Component {
    constructor(props){
        super(props);
    }
 
    render() {
        const transaction = this.props.item

        return (
            <div className='row colored-offset'>
              <div className='col-xs-1 col-xs-offset-0 col-sm-3 col-sm-offset-0'>
                {transaction.ticker}
              </div>

              <div className='col-xs-offset-1 col-xs-3 col-sm-offset-0 col-sm-3'>
                {transaction.shares}
              </div>
              <div className='col-xs-3 col-sm-3'>
                ${transaction.transactionPrice}
              </div>
              <div className='col-xs-3 col-sm-3'>
                {this.props.timeHandler(Number(transaction.createdAt))}
              </div>
            </div>
        );
    }
}