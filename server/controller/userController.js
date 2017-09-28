const Model = require('../../database/models/model.js');
const hasher = require('./password.js');
const auth = require('./authenticateController.js');

module.exports = {
  signup: (req, res) => {
    let base64encoded = req.headers['authorization'].split(' ')[1];
    let convert = Buffer.from(base64encoded, 'base64').toString('utf8').split(':');
    
    Model.User.findOne({where: {handle: convert[0]}})
    .then(response => {
      if(!response){
        hasher.generatePassword(convert[1], hash => {
          Model.User.create({handle: convert[0], password: hash})
          .then(user => auth.getToken(user.dataValues.id, user.dataValues.handle, res))
        })
      } else {
        res.send('invalid');
      }
    })
  },
  login: (req, res) => {
    let base64encoded = req.headers['authorization'].split(' ')[1];
    let convert = Buffer.from(base64encoded, 'base64').toString('utf8').split(':');
    Model.User.findOne({where: {handle: convert[0]}})
    .then(user => {
      if(!user){
          res.send('invalid');
      } else {
          hasher.comparePassword(convert[1], user.dataValues.password, (reply) => {
            if(reply){
              auth.getToken(user.dataValues.id, user.dataValues.handle, res);
            } else {
              res.send('invalid');
            }
          })
      }
    })
          
  }

}



