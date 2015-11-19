#!/usr/bin/env node

'use strict';

process.title = 'rsg-log-viewer';

var startServer = require('../Server/Src/server.js');
var conf = require('confucious');

conf.set("inputplugin", '../Server/Src/mongodb-input');

conf.pushArgv();


startServer(conf, require(conf.get("inputplugin"))());
