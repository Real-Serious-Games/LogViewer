//Configuration settings for connecting to the database that the log viewer will monitor.

module.exports = {
    port: 3412, //port the server will run on. Will default to 3000 if not present
    secret: "secret" //change to GUID per set up of the viewer. Ignored unless the --secret command line argument is used
};