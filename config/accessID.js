

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
        const response = await axios.post('https://prod-24.northcentralus.logic.azure.com:443/workflows/5c0ed215db06475ca39bc55eee7ac6b8/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_Kvsr4SGY2FWeW4Oh_9HM_t77Dxkr4US2gzpE0G03A4', {
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
