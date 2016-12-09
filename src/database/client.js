'use strict'

var Path = require('path')
var request = require('request')

var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'DatabaseClient'
})

function DatabaseClient (database, host, port, token) {
  this.db = database
  this.host = host
  this.port = port
  this.token = token
}

DatabaseClient.prototype.find = function (query, cb) {
  var self = this
  cb = cb || function () {}

  query['__database'] = self.db
  request.get({
    url: `http://${self.host}:${self.port}/api/find`,
    headers: {
      Authorization: `${self.token}`
    },
    qs: query
  }, function (err, res, body) {
    if (err || res.statusCode == 403) {
      if (res.statusCode == 403) {
        LogWorker.error('Unauthorized 403')
        cb(null, [])
      } else {
        cb(err, [])
      }
    } else {
      try {
        body = JSON.parse(body)
        if (body.err) {
          cb(body.err, [])
        } else {
          cb(null, body.data)
        }
      } catch(err) {
        cb(err, [])
      }
    }
  })
}

DatabaseClient.prototype.insert = function (data, cb) {
  var self = this
  cb = cb || function () {}

  data['__database'] = self.db
  request.post({
    url: `http://${self.host}:${self.port}/api/insert`,
    headers: {
      Authorization: `${self.token}`
    },
    form: data
  }, function (err, res, body) {
    if (err || res.statusCode == 403) {
      if (res.statusCode == 403) {
        cb('Database request unauthorized 403')
      } else {
        cb(err)
      }
    } else {
      try {
        body = JSON.parse(body)
        if (body.err) {
          cb(body.err)
        } else {
          cb(null)
        }
      } catch(err) {
        cb(err)
      }
    }
  })
}

DatabaseClient.prototype.update = function (query, data, options, cb) {
  var self = this
  cb = cb || function () {}

  request.post({
    url: `http://${self.host}:${self.port}/api/update`,
    headers: {
      Authorization: `${self.token}`
    },
    form: {
      query: query,
      data: data,
      options: options,
      __database: self.db
    }
  }, function (err, res, body) {
    if (err || res.statusCode == 403) {
      if (res.statusCode == 403) {
        cb('Database request unauthorized 403')
      } else {
        cb(err)
      }
    } else {
      try {
        body = JSON.parse(body)
        if (body.err) {
          cb(body.err)
        } else {
          cb(null)
        }
      } catch(err) {
        cb(err)
      }
    }
  })
}

DatabaseClient.prototype.remove = function (query, options, cb) {
  var self = this
  cb = cb || function () {}

  request.post({
    url: `http://${self.host}:${self.port}/api/remove`,
    headers: {
      Authorization: `${self.token}`
    },
    form: {
      query: query,
      options: options,
      __database: self.db
    }
  }, function (err, res, body) {
    if (err || res.statusCode == 403) {
      if (res.statusCode == 403) {
        cb('Database request unauthorized 403')
      } else {
        cb(err)
      }
    } else {
      try {
        body = JSON.parse(body)
        if (body.err) {
          cb(body.err)
        } else {
          cb(null)
        }
      } catch(err) {
        cb(err)
      }
    }
  })
}
module.exports = DatabaseClient
