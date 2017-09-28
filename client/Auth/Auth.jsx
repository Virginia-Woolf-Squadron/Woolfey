const axios = require('axios');
export default class Auth {
    constructor(){
      this.signup = this.signup.bind(this);
      this.login = this.login.bind(this);
      this.setSession = this.setSession.bind(this);
    }
    signup(handle, password, callback){
      let base64encoded = new Buffer(handle + ':' + password).toString('base64');
      axios({
        method: 'post',
        url: '/api/signup',
        headers: {'Authorization': `Basic ${base64encoded}`}
      })
      .then(reply => {
        if(reply.data === 'invalid'){
          alert('Username taken')
          callback('invalid');
        } else {
          this.setSession(reply.data);
          callback('success');
        }
      })
    }
    login(handle, password, callback) {
      let base64login = new Buffer(handle + ':' + password).toString('base64');
      axios({
        method: 'get',
        url: '/api/login',
        headers: {'Authorization': `Basic ${base64login}`}
      })
      .then(reply => {
        if(reply.data === 'invalid'){
          alert('Username or password invalid')
          callback('invalid');
        } else {
          this.setSession(reply.data);
          callback('success');
        }
      });
    }
    setSession(token){
      localStorage.setItem('token', token.token);
    }
}