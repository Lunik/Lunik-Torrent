var Log = require('./log.js')
var config = require('../configs/config.json')

var fs = require('fs')
function Auth(){
  this.passwords = {}
  this.loadPasswords()
  this.invites
}

Auth.prototype.login = function(user, pass){
  if(this.passwords[user].pass === "pass"){
    this.passwords[user].token = this.genToken(user, pass)
  }
}

Auth.prototype.logout = function(user){

}

Auth.prototype.register = function(user, pass, invite){

}

Auth.prototype.checkLogged = function(user, token){
  if(this.passwords[user].token && this.passwords[user].token === token){
    return true
  } else {
    return false
  }
}

Auth.prototype.genToken = function(user, pass){
  var token

  return token
}

/**
 * Load configs/fileInfo.json into Directory.fileInfo.
*/
Auth.prototype.loadPasswords = function () {
  var self = this
  setTimeout(function () {
    fs.readFile('configs/passwords.json', function (err, data) {
      if (err) {
        console.log(err)
        self.passwords = {}
        self.savePasswords()
      } else {
        self.passwords = JSON.parse(data)
      }
    })
  }, 1)
}

/**
 * Save Directory.fileInfo into configs/fileInfo.json.
*/
Auth.prototype.savePasswords = function () {
  var self = this
  setTimeout(function () {
    fs.writeFile('configs/passwords.json', JSON.stringify(self.passwords), function (err) {
      if (err) console.log(err)
    })
  }, 1)
}

module.exports = new Auth()
