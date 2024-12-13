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


    try {
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

        // Get report details including embed URL
        const reportResponse = await axios.get(
            `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const embedUrl = reportResponse.data.embedUrl;

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

        // Return the embed information
        return {
            embedToken: embedToken,
            embedUrl: embedUrl,
            reportId: reportId
        };
    } catch (error) {
        console.error('Error fetching Power BI embed info:', error);
        throw error;
    }

    // // Get access token from Azure AD
    // const tokenResponse = await axios.post(
    //     `${authorityUrl}/oauth2/v2.0/token`,
    //     new URLSearchParams({
    //         grant_type: 'client_credentials',
    //         client_id: clientId,
    //         client_secret: clientSecret,
    //         scope: `${resourceUrl}/.default`
    //     })
    // );

    // const accessToken = tokenResponse.data.access_token;

    // // Generate embed token for the report
    // const embedTokenResponse = await axios.post(
    //     apiUrl,
    //     { accessLevel: 'View' },
    //     {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: `Bearer ${accessToken}`
    //         }
    //     }
    // );

    // const embedToken = embedTokenResponse.data.token;

    // // Get report details including embed URL
    // const reportResponse = await axios.get(
    //     `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
    //     {
    //         headers: {
    //             Authorization: `Bearer ${accessToken}`
    //         }
    //     }
    // );

    // return {
    //     embedUrl: reportResponse.data.embedUrl,
    //     embedToken: embedToken,
    //     reportId: reportId
    // };
}



async function fetchReportsMenu(AuthID) {
    const reportsList2 = [];
    const response = await axios.post(process.env.AZUREGNAPI_ENDPOINT, {
        TypeOfRequest: "fetchReportsMenu",
        AuthID: AuthID  
    });

    const rapports = response.data.reportMenu.ResultSets.Table1
    rapports.forEach(rapport => {
        reportsList2.push({
            id:rapport.ReportID,
            name: rapport.ItemName,
            icon: rapport.ReportIcon
        });
    })

    return reportsList2 
}



module.exports = {
    fetchPowerBIEmbedInfo: fetchPowerBIEmbedInfo,
    fetchReportsMenu:fetchReportsMenu
};