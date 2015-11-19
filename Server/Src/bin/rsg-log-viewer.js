#!/usr/bin/env node

'use strict';

process.title = 'rsg-log-viewer';

var startServer = require('../server.js');
var conf = require('confucious');

conf.set("inputplugin", './mongodb-input');

conf.pushArgv();


startServer(conf, require(conf.get("inputplugin"))());
