// require('dotenv').config();
const {LogLevel } = require('@azure/msal-node')
require('dotenv').config();

module.exports = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,  
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
    },
    system: {
        loggerOptions: {
            loggerCallback(logLevel, message, containsPii) {
                // console.log(message);
            },
            piiLoggingEnabled: true,
            logLevel: LogLevel.Verbose,
        }
    }
};
