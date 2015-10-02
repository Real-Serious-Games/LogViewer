//Configuration settings for connecting to the database that the log viewer will monitor.

module.exports = {
    host: "localhost",
    port: 3412,
    database: "logs",
    errorsCollectionName: "errors",
    logCollectionName: "logs",
    secret: "secret" //change to GUID per set up of the viewer
};