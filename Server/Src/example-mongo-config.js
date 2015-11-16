//Configuration settings for connecting to the database that the log viewer will monitor.

module.exports = {
    host: "dbtest-PC", //optional, only required if using the mongodb-input plugin that is used by default
    database: "logs", //optional, only required if using the mongodb-input plugin. The name of the database on the host.
    errorsCollectionName: "unity.build.errors", //optional, only required if using the mongodb-input plugin. The name of the collection for error messages. 
    logCollectionName: "unity.build.logs", //optional, only required if using the mongodb-input plugin. The name of the collection for log messages.
};