// require('dotenv').config();
const {LogLevel } = require('@azure/msal-node')


module.exports = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,  
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
    },
    system: {
        loggerOptions: {
            loggerCallback(logLevel, message, containsPii) {
            },
            piiLoggingEnabled: true,
            logLevel: LogLevel.Verbose,
        }
    }
};
