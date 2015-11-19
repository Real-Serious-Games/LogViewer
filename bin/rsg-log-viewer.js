#!/usr/bin/env node

'use strict';

process.title = 'rsg-log-viewer';

var startServer = require('../Server/Src/server.js');
var argv = require('yargs').argv;
var conf = require('confucious');
var fs = require('fs');

//set up the default path to the configuration file.
var configFilePath ="config.json";

//set up the default plugin to use.
conf.set("inputplugin", './mongodb-input');

//if a config file was provided on the command line, check that it exists and use it if it does
if (argv.config) {
	if (fs.existsSync(argv.config)) {
		configFilePath = argv.config;
	}
}

//check that our file exists
if (fs.existsSync(configFilePath)) {
	conf.pushJsonFile(configFilePath);
} 

conf.pushArgv();

//
//Run from command line
//
startServer(conf, require(conf.get("inputplugin"))(conf));
