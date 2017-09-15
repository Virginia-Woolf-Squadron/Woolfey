import React from 'react';
import TransactionHistoryEntry from './TransactionHistoryEntry.jsx'; 
import axios from 'axios'
import moment from 'moment'

export default class TransactionHistory extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            transactions: []
        }
        this.timeHandler = this.timeHandler.bind(this);
    }
    componentWillReceiveProps(nextProps) {
      this.setState({transactions: nextProps.transactions})
    } 
    timeHandler(date){
      return moment(date).fromNow()
    }
    render() {
        return (
            <div >
         
              <div className='row'>
               <div className='col-xs-2 col-xs-offset-1'>Coin</div>
               <div className='col-xs-2'>Buy/Sell?</div>
               <div className='col-xs-2'>Quantity</div>
               <div className='col-xs-2'>Coin price</div>
               <div className='col-xs-3'>When</div>
             </div >
             <hr/>
                {this.state.transactions ? this.state.transactions.map((item, index) => (
                    <TransactionHistoryEntry item={item} key={index} timeHandler={this.timeHandler}/>
                ))
                :
                null}
            </div>
        );
    }
}
