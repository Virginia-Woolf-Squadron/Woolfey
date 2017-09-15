import React from 'react';
import Signup from '../Auth/Signup.jsx';
import Login from '../Auth/Login.jsx';
import Auth from '../Auth/Auth.jsx';
import axios from 'axios'
import Navigation from './Navbar';
import {Tab, Tabs} from 'react-bootstrap'
import {Carousel} from 'react-bootstrap'

export default class LoginPage extends React.Component {
  constructor() {
    super()
    this.Auth = new Auth;
    this.state = {
      token: localStorage.getItem('token'),
      isLoggedIn: false
    }
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleFetchData = this.handleFetchData.bind(this);
  }

  handleSignUp(){
    this.setState({token: localStorage.getItem('token')})
  }

  handleLogin(){
    this.setState({token: localStorage.getItem('token')}, () => this.handleFetchData())
  }

  handleFetchData(){
    axios.get('/api/getUserData', {headers: {authorization:this.state.token}})
    .then(reply => this.setState({portfolios: reply.data,
                                  isLoggedIn: true}))
    .catch(err => console.log(err, 'error'))
  }

  render() {

    return (

      <div className='container'>

        <Navigation handleLogOut={this.handleLogOut} isLoggedIn={this.state.isLoggedIn}/>

        <div className='row'>
          <div className='col-sm-6 col-sm-offset-3'>
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example" style={{'marginTop':'100px'}}>
              <Tab eventKey={1} title="Login">
                <Login fetch={this.handleFetchData} handleLogin={this.handleLogin}/>
              </Tab>
              <Tab eventKey={2} title="Signup">
                <Signup fetch={this.handleFetchData} handleSignUp={this.handleSignUp}/>
              </Tab>
            </Tabs>
          </div>
        </div>

      </div>
    )
  }
}