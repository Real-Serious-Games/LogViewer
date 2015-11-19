##LogViewer

A front end viewer for displaying and querying a collection of logs. This system expects the logs to be in the [Serilog](http://serilog.net/) structured logging format. 

The logs will also need to be stored somewhere. The LogViewer is set up to use a plugin style system for connecting to this source. Currently the source code includes a mongo db plugin called mongodb-input.js (which is used by default when run from the command line) that can be used as a guide for creating your own. It is also possible to pipe logs directly from the [RSG LogServer](https://github.com/Real-Serious-Games/LogServer) as it has also been designed to use plugins for it's output.

##Installation
	npm install -g rsg-log-viewer


##Run
	rsg-log-viewer [options] 


##Configuration
Edit the file config.json to set the port the server will run on. Any configuration needed for your input plugin will go in here as well and can be overridden on the command line. For instance if you want to use the default mongodb plugin you'd include the database configuration as follows.

	{
		"port": "3412",
		"secret": "secret",
		"host": "localhost",
		"database": "logs",
		"logCollection": "logs"
	}
	
	
###Command line options

Option 			| Description
:---: 			| ---
--secret 		| if provided (and --usesecret is provided as well) then this will override the secret provided in the config file.
--port 			| override the config file's port number
--config 		| provide the path to a config file, using this instead of the default config.js file
--inputplugin 	| provides a path to the plugin to use as the input source for the logs [defualt: mongodb-input.js] eg. --inputplugin="./mongodb-input"