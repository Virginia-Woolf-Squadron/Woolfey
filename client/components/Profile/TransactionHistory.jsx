import React from 'react';
import TransactionHistoryEntry from './TransactionHistoryEntry.jsx'; 
import {Tabs, Tab} from 'react-bootstrap'
import axios from 'axios'
import moment from 'moment'

export default class TransactionHistory extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            buys: [],
            sells: [],
            key: 1
        }
        this.timeHandler = this.timeHandler.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillReceiveProps(nextProps) {
      if(nextProps.transactions.length > this.state.buys.length + this.state.sells.length && this.state.buys.length + this.state.sells.length > 0){
        if(nextProps.transactions[0].transactionType ==='sell'){
          this.state.sells.unshift(nextProps.transactions[0]);
          this.setState({ sells })
        } else {
          this.state.buys.unshift(nextProps.transactions[0]);
          this.setState({ buys })
        }
      } else if(nextProps.transactions.length > this.state.buys.length + this.state.sells.length){
        const buy = [];
        const sell = [];

        for(var i = 0; i < nextProps.transactions.length; i++){
          if(nextProps.transactions[i].transactionType == 'sell'){
            sell.push(nextProps.transactions[i])
          } else {
            buy.push(nextProps.transactions[i])
          }
        }
        this.setState({buys: buy, sells: sell})
      }
    } 
    timeHandler(date){
      return moment(date).fromNow()
    }
    handleSelect(key){
      this.setState({ key })
    }
    render() {
        return (
            <div >
              <Tabs activeKey={this.state.key} onSelect={this.handleSelect} id="uncontrolled-tab-example">
                <Tab eventKey={1}title='Buys'>
              <div className='row'>
               <div className='col-xs-1 col-sm-3 col-sm-offset-0'>Coin</div>
               <div className='col-xs-offset-1 col-xs-3  col-sm-offset-0 col-sm-3'>Qty</div>
               <div className='col-xs-3 col-sm-3'>Coin price</div>
               <div className='col-xs-3 col-sm-3'>When</div>
             </div >
             <hr/>
                {this.state.buys ? this.state.buys.map((item, index) => (
                    <TransactionHistoryEntry item={item} key={index} timeHandler={this.timeHandler}/>
                ))
                :
                null}
                </Tab>
                <Tab eventKey={2} title='Sells'>
                <div className='row'>
               <div className='col-xs-1 col-sm-3 col-sm-offset-0'>Coin</div>
               <div className='col-xs-offset-1 col-xs-3  col-sm-offset-0 col-sm-3'>Qty</div>
               <div className='col-xs-3 col-sm-3'>Coin price</div>
               <div className='col-xs-3 col-sm-3'>When</div>
             </div >
             <hr/>
                {this.state.sells ? this.state.sells.map((item, index) => (
                    <TransactionHistoryEntry item={item} key={index} timeHandler={this.timeHandler}/>
                ))
                :
                null}
                  </Tab>
                </Tabs>
            </div>
        );
    }
}
