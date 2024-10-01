const axios = require('axios');
// Function to fetch Power BI embedding information for a specific report
async function fetchPowerBIEmbedInfo(reportId) {
    const workspaceId = process.env.POWERBI_WORKSPACE_ID;
    const tenantId = process.env.POWERBI_TENANT_ID;
    const clientId = process.env.POWERBI_CLIENT_ID;
    const clientSecret = process.env.POWERBI_CLIENT_SECRET;

    const authorityUrl = `https://login.microsoftonline.com/${tenantId}`;
    const resourceUrl = 'https://analysis.windows.net/powerbi/api';
    const apiUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`;

    // Get access token from Azure AD
    const tokenResponse = await axios.post(
        `${authorityUrl}/oauth2/v2.0/token`,
        new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: `${resourceUrl}/.default`
        })
    );

    const accessToken = tokenResponse.data.access_token;

    // Generate embed token for the report
    const embedTokenResponse = await axios.post(
        apiUrl,
        { accessLevel: 'View' },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    const embedToken = embedTokenResponse.data.token;

    // Get report details including embed URL
    const reportResponse = await axios.get(
        `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    );

    return {
        embedUrl: reportResponse.data.embedUrl,
        embedToken: embedToken,
        reportId: reportId
    };
}


// Load reports configuration from environment variables
const numberOfReports = parseInt(process.env.NUM_REPORTS, 10);
const reportsList = [];

// Populate reportsList with data from environment variables
for (let i = 1; i <= numberOfReports; i++) {
    reportsList.push({
        id: process.env[`REPORT_${i}_ID`],
        name: process.env[`REPORT_${i}_NAME`],
        icon: process.env[`REPORT_${i}_ICON`]
    });
}


module.exports = {
    fetchPowerBIEmbedInfo: fetchPowerBIEmbedInfo,
    reportsList: reportsList
};