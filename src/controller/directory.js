var Path = require('path')
var express = require('express')
var router = express.Router()

var Directory = require(Path.join(__base, 'src/worker/directory'))
var InfoEngine = require(Path.join(__base, 'src/worker/mediaInfo'))
var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Server'
})

router.get('/directory', function (req, res) {
  res.header('Content-Type', 'application/json')
  res.end(JSON.stringify({
    GET: [
      'list',
      'lock',
      'info'
    ],
    POST: [
      'remove',
      'rename',
      'mkdir',
      'mv'
    ]
  }))
})

// client ask list of directory
router.get('/directory/list', function (req, res) {
  if (req.query.dir) {
    req.query.dir = req.query.dir.replace(/%20/g, ' ')
    Directory.list(req.query.dir, function (dir) {
      res.end(JSON.stringify(dir))
    })
  } else {
    res.end(JSON.stringify({
      err: 'Undefined directory.'
    }))
  }
})

// client remove directory / file
router.post('/directory/remove', function (req, res) {
  if (req.body.file) {
    req.body.file = req.body.file.replace(/%20/g, ' ')

    Directory.remove(req.body.file, function (err) {
      if (!err) {
        LogWorker.info(`${req.cookies.user} remove file: ${req.body.file}`)
        res.end(JSON.stringify({
          file: req.body.file.split('/')[req.body.file.split('/').length - 1]
        }))
      } else {
        res.end(JSON.stringify({
          err: 'Cannot remove, someone is downloading the file.'
        }))
      }
    })
  } else {
    res.end(JSON.stringify({
      err: 'Wrong file.'
    }))
  }
})

// client rename file
router.post('/directory/rename', function (req, res) {
  if (req.body.path && req.body.oldname && req.body.newname) {
    req.body.path = req.body.path.replace(/%20/g, ' ')
    req.body.oldname = req.body.oldname.replace(/%20/g, ' ')
    req.body.newname = req.body.newname.replace(/%20/g, ' ')
    Directory.rename(req.body.path, req.body.oldname, req.body.newname, function (err) {
      if (!err) {
        LogWorker.info(`${req.cookies.user} rename file: ${Path.join(req.body.path, req.body.oldname)} in: ${req.body.newname}`)
        res.end(JSON.stringify({
          path: req.body.path,
          oldname: req.body.oldname,
          newname: req.body.newname
        }))
        Directory.setOwner(Path.join(req.body.path, req.body.newname), req.cookies.user)
      } else {
        res.end(JSON.stringify({
          err: 'Cannot rename, someone is downloading the file.'
        }))
      }
    })
  } else {
    res.end(JSON.stringify({
      err: 'Wrong name.'
    }))
  }
})

// client create directory
router.post('/directory/mkdir', function (req, res) {
  if (req.body.path && req.body.name) {
    req.body.path = req.body.path.replace(/%20/g, ' ')
    req.body.name = req.body.name.replace(/%20/g, ' ')
    LogWorker.info(`${req.cookies.user} create directory: ${Path.join(req.body.path, req.body.name)}`)
    Directory.mkdir(req.body.path, req.body.name, req.cookies.user)
    res.end(JSON.stringify({
      name: req.body.name
    }))
    Directory.setOwner(Path.join(req.body.path, req.body.name), req.cookies.user)
  } else {
    res.end(JSON.stringify({
      err: 'Wrong name.'
    }))
  }
})

// client move directory
router.post('/directory/mv', function (req, res) {
  if (req.body.path && req.body.file && req.body.folder) {
    req.body.path = req.body.path.replace(/%20/g, ' ')
    req.body.file = req.body.file.replace(/%20/g, ' ')
    req.body.folder = req.body.folder.replace(/%20/g, ' ')
    Directory.mv(req.body.path, req.body.file, req.body.folder, function (error) {
      if (!error) {
        LogWorker.info(`${req.cookies.user} move: ${Path.join(req.body.path, req.body.file)} in: ${Path.join(req.body.path, req.body.folder)}`)
        res.end(JSON.stringify({
          file: req.body.file
        }))
        Directory.setOwner(Path.join(req.body.path, req.body.folder, req.body.file), req.cookies.user)
      } else {
        res.end(JSON.stringify({
          err: 'Cannot move, someone is downloading the file.'
        }))
      }
    })
  } else {
    res.end(JSON.stringify({
      err: 'Wrong name.'
    }))
  }
})

// lock api request
router.get('/directory/lock', function (req, res) {
  if (req.query.f) {
    req.query.f = req.query.f.replace(/%20/g, ' ')
    Directory.isDownloading(req.query.f, function (isdl) {
      res.end(isdl.toString())
    })
  } else {
    res.end(JSON.stringify({
      err: 'File not set.'
    }))
  }
})

// client get meida info
router.get('/directory/info', function (req, res) {
  if (req.query.type && req.query.query) {
    req.query.type = req.query.type.replace(/%20/g, ' ')
    req.query.query = req.query.query.replace(/%20/g, ' ')
    InfoEngine.getInfo(req.query.type, req.query.query, function (data) {
      res.end(JSON.stringify(data))
    })
  } else {
    res.end(JSON.stringify({
      err: 'Type or query not set.'
    }))
  }
})

module.exports = router
