//Configuration settings for connecting to the database that the log viewer will monitor.

module.exports = {
    host: "dbtest-PC",
    port: 3412,
    database: "logs",
    errorsCollectionName: "unity.build.errors",
    logCollectionName: "unity.build.logs",
    secret: "secret" //change to GUID per set up of the viewer
};