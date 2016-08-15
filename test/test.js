'use strict'

var path = require('path')
var fs = require('fs')

global.__base = path.join(__dirname, '..', '/')
global.__config = require(path.join(__base, 'configs/config.json'))

var assert = require('chai').assert
