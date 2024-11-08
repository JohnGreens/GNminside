const axios = require('axios');

// Function to merge project and organization data
function mergeData(eaasData, klimaData) {
    const mergedData = {};

    eaasData.forEach(project => {
        const matchingOrg = klimaData.find(org => project.eaasProjectName === org.OrgLevel2);
        const key = project.eaasProjectName;

        if (!mergedData[key]) {
            mergedData[key] = {
                name: key,
                projectIDs: [],
                orgIDs: []
            };
        }

        mergedData[key].projectIDs.push(project.eaasAccessID);
        if (matchingOrg) {
            mergedData[key].orgIDs.push(matchingOrg.OrgUnitID);
        }
    });

    klimaData.forEach(org => {
        const key = org.OrgLevel2;

        if (!mergedData[key]) {
            mergedData[key] = {
                name: key,
                projectIDs: [],
                orgIDs: []
            };
        }

        if (!mergedData[key].orgIDs.includes(org.OrgUnitID)) {
            mergedData[key].orgIDs.push(org.OrgUnitID);
        }
    });

    return Object.values(mergedData);
}

// Example usage: Fetching data from an API
async function GetAccessID(AuthID) {
    try { 
        const response = await axios.post(process.env.AZUREGNAPI_ENDPOINT, {
            TypeOfRequest: "GetAccessID",
            AuthID: AuthID  
        });
        const data = response.data;
        const eaasData = data.eaas;  // Project data
        const klimaData = data.klima; // Organization data
        const accessCheck = data.accesscheck;
        // const userInfo = data.userInfo;
        let mergedData = []
        if (accessCheck){
        mergedData = mergeData(eaasData, klimaData);
        }

        const dataAlt = {
            userData: data,
            accessCode: mergedData
        };

        return dataAlt;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Error retrieving access ID and merging data');
    }
}

module.exports = { GetAccessID };
