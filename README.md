##LogViewer

A front end viewer for displaying and querying a collection of logs. This system expects the logs to be in the [Serilog](http://serilog.net/) structured logging format. 

The logs will also need to be stored somewhere. The LogViewer is set up to use a plugin style system for connecting to this source. Currently the source code includes a mongo db plugin called mongodb-input.js (which is used by default when run from the command line) that can be used as a guide for creating your own. It is also possible to pipe logs directly from the [RSG LogServer](https://github.com/Real-Serious-Games/LogServer) as it has also been designed to use plugins for it's output.

##Installation
	npm install rsg-logviewer

##Usage

###Setup
The LogViewer can be run from the command line or required in as a node module

###Configuration
Rename *exampleConfig.js* to *config.js* and fill out the details appropriately. ExampleConfig is thoroughly commented.

If you plan on using the default mongodb-input plugin, also rename *example-mongo-config.js* to *mongo-config.js* and fill it out with your database details.

####Node module method:
	var input-plugin = require('path_to_input_plugin')();
	var logViewer = require('path_to_logViewer_server.js')(input-plugin);

####Command line method:
When run from the command line the default mongodb-input plugin will be used by default.

	node server.js [options] 

###Command line options

	Options:
	--usesecret				Use a secret in the url for added security. This can be provided with --secret from the 
							command line, or the config file if no command line argument is provided. [default: false]
	--secret				if provided (and --usesecret is provided as well) then this will override the secret 
							provided in the config file.
	--port					override the config file's port number
	--config				provide the path to a config file, using this instead of the default config.js file
	
	--inputplugin			provides a path to the plugin to use as the input source for the logs	[defualt: mongodb-input.js]
							eg. --inputplugin="./mongodb-input"