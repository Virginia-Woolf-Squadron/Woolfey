import React from 'react';
import Auth from './Auth.jsx';
import axios from 'axios';

class Signup extends React.Component {
    constructor(props){
        super(props);
        this.Auth = new Auth;
        this.state = {username: '', password: '', forbidden: '<>\\/{}[]:;\'"^'.split('')}
        this.handlePassword = this.handlePassword.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.checkSpecialCharacters = this.checkSpecialCharacters.bind(this);
        this.checkPasswordRequirements = this.checkPasswordRequirements.bind(this);  
    }
    
    handleUsername(event) {
        this.setState({username: event.target.value});
    }
    handlePassword(event){
        this.setState({password: event.target.value})
    }
    checkSpecialCharacters(){
      if(this.state.forbidden.every(x => this.state.username.indexOf(x) < 0 && this.state.password.indexOf(x) < 0)){
        return true;
      } else {
        return false;
      }
    }
    checkPasswordRequirements(){
      let password = this.state.password;
      return password.toLowerCase() !== password && password.toUpperCase() !== password && /\d/.test(password) && password.length <= 10 && password.length >= 5;
    }
    handleSubmit(event) {
        event.preventDefault();
        if(this.checkSpecialCharacters()){
          if(this.checkPasswordRequirements()){
            this.Auth.signup(this.state.username, this.state.password, (reply) => {
              if(reply !== 'invalid'){
                this.props.handleSignUp();
                window.location = '/portfolio'
              }
            })
          } else {
            alert('Password doesn\'t meet requirements')
          }
        } else {
          alert('No special characters');
        }
        this.setState({username: '', password: ''});
    }


    render() {
        return (
            <div>
                <div className='col-xs-10 col-xs-offset-1'>
                    <h2 style={{'marginTop':'20px'}}>Signup</h2>
                    <form className='form-horizontal' onSubmit = {this.handleSubmit}>
                        <label className='control-label' >Username: </label>
                        <div className='input-group'>
                            <span className="input-group-addon"><i className="glyphicon glyphicon-user"></i></span>
                            <input type="text" className='form-control' placeholder='Enter username' value={this.state.username} onChange={this.handleUsername} />
                        </div>
                        <label className='control-label' >Password: </label>
                        <div className='input-group'>
                            <span className="input-group-addon"><i className="glyphicon glyphicon-lock"></i></span>
                            <input type="password" className='form-control' placeholder='Enter password' value={this.state.password} onChange={this.handlePassword} />
                        </div>
                        <div>
                            <button type="submit" className='btn btn-primary btn-block loginSignupSubmitBtn' value="Submit">Submit</button>
                        </div>
                    </form>
                    <ul aria-label="Password requires: ">
                    <li>one lowercase letter</li>
                    <li>one uppercase letter</li>
                    <li>one number</li>
                    <li>between 5-10 characters</li>
                    </ul>
                </div>
             
            </div>
        );
    }
}

export default Signup;