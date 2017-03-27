'use strict'

var Path = require('path')
var request = require('request')

var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'DatabaseClient'
})

class DatabaseClient {
  constructor (database, host, port, token) {
    this.db = database
    this.host = host
    this.port = port
    this.token = token
  }

  find (query, cb = () => {}) {
    query['__database'] = this.db
    request.get({
      url: `http://${this.host}:${this.port}/api/find`,
      headers: {
        Authorization: `${this.token}`
      },
      qs: query
    }, (err, res, body) => {
      if (err || res.statusCode === 403) {
        if (res && res.statusCode === 403) {
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
        } catch (err) {
          cb(err, [])
        }
      }
    })
  }

  insert (data, cb = () => {}) {
    data['__database'] = this.db
    request.post({
      url: `http://${this.host}:${this.port}/api/insert`,
      headers: {
        Authorization: `${this.token}`
      },
      form: data
    }, (err, res, body) => {
      if (err || res.statusCode === 403) {
        if (res && res.statusCode === 403) {
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
        } catch (err) {
          cb(err)
        }
      }
    })
  }

  update (query, data, options, cb = () => {}) {
    request.post({
      url: `http://${this.host}:${this.port}/api/update`,
      headers: {
        Authorization: `${this.token}`
      },
      form: {
        query: query,
        data: data,
        options: options,
        __database: this.db
      }
    }, (err, res, body) => {
      if (err || res.statusCode === 403) {
        if (res && res.statusCode === 403) {
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
        } catch (err) {
          cb(err)
        }
      }
    })
  }

  remove (query, options, cb = () => {}) {
    request.post({
      url: `http://${this.host}:${this.port}/api/remove`,
      headers: {
        Authorization: `${this.token}`
      },
      form: {
        query: query,
        options: options,
        __database: this.db
      }
    }, (err, res, body) => {
      if (err || res.statusCode === 403) {
        if (res && res.statusCode === 403) {
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
        } catch (err) {
          cb(err)
        }
      }
    })
  }
}
module.exports = DatabaseClient
