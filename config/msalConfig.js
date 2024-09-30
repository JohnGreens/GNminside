// require('dotenv').config();
const { ConfidentialClientApplication, LogLevel } = require('@azure/msal-node')
// module.exports = {
//     auth: {
//         clientId: process.env.AZURE_CLIENT_ID,
//         authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
//         clientSecret: process.env.AZURE_CLIENT_SECRET,
//     },
//     system: {
//         loggerOptions: {
//             loggerCallback(loglevel, message, containsPii) {
//                 console.log(message);
//             },
//             piiLoggingEnabled: false,
//             logLevel: LogLevel.Verbose,
//         }
//     }
// };

// config/msalConfig.js
require('dotenv').config();

module.exports = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,  // Should match Azure AD app registration
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
    },
    system: {
        loggerOptions: {
            loggerCallback(logLevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: true,
            logLevel: LogLevel.Verbose,
        }
    }
};
