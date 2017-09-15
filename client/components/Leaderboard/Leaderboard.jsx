import React from 'react'
import LeaderboardEntry from './LeaderboardEntry.jsx'
import Navbar from '../Navbar.js'
import axios from 'axios'
import {Tab, Tabs} from 'react-bootstrap'

export default class Leaderboard extends React.Component {
  constructor(){
    super();
    this.state = {
      leaderboard: null,
      hourlyLeaderboard: null,
      dailyLeaderboard: null,
      loggedIn: false,
      key: 'leaderboard',
      spinner: true
    }
    this.fetchLeaderboard = this.fetchLeaderboard.bind(this);
    this.handleSelect = this.handleSelect.bind(this)
    this.handleLogOut = this.handleLogOut.bind(this);
  }
  
  componentWillMount() {
    this.fetchLeaderboard('leaderboard');
    if (localStorage.getItem('token')) {
      this.setState({ loggedIn: true })
    }
  }

  handleLogOut(){
    localStorage.removeItem('token')
    this.setState({
      loggedIn: false
    })
  }

  fetchLeaderboard(board){
    axios.get('/api/fetchSpecificLeaderboard', {params: {leaderboard: board}})
    .then(reply => {
      this.setState({
        [board]: reply.data,
        spinner: false
      })
    })
  }

  handleSelect(key){
    if(!this.state[key]){
      this.setState({key, spinner: true}, () => {
        this.fetchLeaderboard(key)});
    } else{
      this.setState({ key });
    }
  }
  
  render() {
    return (
      <div>
        <div className='container'>
          <div className='row'>
            <Navbar handleLogOut={this.handleLogOut} loggedIn={this.state.loggedIn}/>
          </div>
          <div className='row'>
            <div className='col-xs-12'>
              <h1 style={{'marginTop':'90px', 'marginBottom':'30px'}} className='text-center'>Leaderboards</h1>
              {this.state.spinner ? 

                <div className='leaderboard-loader'></div>
                :
              <Tabs activeKey={this.state.key} onSelect={this.handleSelect} id="uncontrolled-tab-example">
                
                <Tab eventKey={'leaderboard'} title="Total Value">
                  <table className='table-responsive table-hover leaderboardTable'>
                    <thead className='thead-default'>
                      <tr>
                        <th style={{ 'textAlign':'center' }}>Rank</th>
                        <th style={{ 'textAlign':'center' }}>Username</th>
                        <th style={{ 'textAlign':'center' }}>Portfolio Name</th>
                        <th style={{ 'textAlign':'center' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.leaderboard !== null ?
                      this.state.leaderboard.map((item, index) => (
                        <LeaderboardEntry item={item} key={index} index={index}  /> 
                      ))
                      :
                      null
                      }
                    </tbody>
                  </table>
                </Tab>
                <Tab eventKey={'hourlyLeaderboard'} title="Hourly Gain" >
                  <table className='table-responsive table-hover leaderboardTable'>
                    <thead className='thead-default'>  
                      <tr>
                        <th style={{ 'textAlign':'center' }}>Rank</th>
                        <th style={{ 'textAlign':'center' }}>Username</th>
                        <th style={{ 'textAlign':'center' }}>Portfolio Name</th>
                        <th style={{ 'textAlign':'center' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.hourlyLeaderboard !== null  ?
                      this.state.hourlyLeaderboard.map((item, index) => (
                        <LeaderboardEntry item={item} key={index} index={index}  /> 
                      ))
                      :
                      null
                      }
                    </tbody>
                  </table>
                </Tab>
                <Tab eventKey={'dailyLeaderboard'}  title='Daily Gain' >
                <table className='table-responsive table-hover leaderboardTable'>
                    <thead className='thead-default'>  
                      <tr>
                        <th style={{ 'textAlign':'center' }}>Rank</th>
                        <th style={{ 'textAlign':'center' }}>Username</th>
                        <th style={{ 'textAlign':'center' }}>Portfolio Name</th>
                        <th style={{ 'textAlign':'center' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.dailyLeaderboard !== null ?
                      this.state.dailyLeaderboard.map((item, index) => (
                        <LeaderboardEntry item={item} key={index} index={index}  /> 
                      ))
                      :
                      null
                      }
                    </tbody>
                  </table>
                </Tab>

              </Tabs>
              
              
              }
              
            </div>
          </div>
        </div>
      </div>

    )
  }
}

