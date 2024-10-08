// Initialize the Power BI service
const powerBIService = new window['powerbi-client'].service.Service(
    window['powerbi-client'].factories.hpmFactory, 
    window['powerbi-client'].factories.wpmpFactory, 
    window['powerbi-client'].factories.routerFactory
);

const reportContainerElement = document.getElementById('reportContainer');
let reportInstance;
let currentReportPageName = null;

// Function to embed a Power BI report with the given filters
function embedReport(reportId, projectFilterValues = []) {

    // Default to all projects and OUIDs if no specific filters are provided
    if (!projectFilterValues || projectFilterValues.length === 0) {
        projectFilterValues = getProjectAccessDetails().map(project => project.projectID);
    }

    // Extract the OUIDs from projectAccessDetails
    const ouidFilterValues = getProjectAccessDetails().map(project => project.orgID);

    // Clear previous instance before embedding
    powerBIService.reset(reportContainerElement);

    fetch(`/embed-info/${reportId}`)
        .then(response => response.json())
        .then(embedInfo => {
            const filters = [
                {
                    $schema: "http://powerbi.com/product/schema#basic",
                    target: {
                        table: "Min Side IDs",
                        column: "ProjectID"
                    },
                    operator: "In",
                    values: projectFilterValues.map(Number)  // Ensure filter values are numbers
                },
                {
                    $schema: "http://powerbi.com/product/schema#basic",
                    target: {
                        table: "Organization_OrgUnit",
                        column: "OrgUnitID"
                    },
                    operator: "In",
                    values: ouidFilterValues.filter(id => id !== null)
                }
            ];

            const reportConfig = {
                type: 'report',
                tokenType: window['powerbi-client'].models.TokenType.Embed,
                accessToken: embedInfo.embedToken,
                embedUrl: embedInfo.embedUrl,
                id: embedInfo.reportId,
                filters: filters,
                settings: {
                    filterPaneEnabled: true,
                    navContentPaneEnabled: false,
                    layoutType: 3
                }
            };

            // Embed the report
            reportInstance = powerBIService.embed(reportContainerElement, reportConfig);
        })
        .catch(error => {
            console.error('Error loading report:', error);
        });
}








// Function to update filters without re-rendering the report
async function updateReportFilters(selectedProjectIds, selectedOUIDs) {
    console.log('Updating report filters with Project IDs:', selectedProjectIds, 'and OUIDs:', selectedOUIDs);

    // Check if no selections were made
    if (!selectedProjectIds || selectedProjectIds.length === 0) {
        selectedProjectIds = getProjectAccessDetails()
            .map(project => project.projectID)
            .filter(id => id !== null && id !== undefined && !isNaN(id));  // Filter out invalid project IDs
        console.log('No projects selected, applying all valid project IDs:', selectedProjectIds);
    }

    if (!selectedOUIDs || selectedOUIDs.length === 0) {
        selectedOUIDs = getProjectAccessDetails()
            .map(project => project.orgID)
            .filter(id => id !== null && id !== undefined && !isNaN(id));  // Filter out invalid OUIDs
        console.log('No OUIDs selected, applying all valid OUIDs:', selectedOUIDs);
    }

    if (reportInstance) {
        try {
            const filters = [
                {
                    $schema: "http://powerbi.com/product/schema#basic",
                    target: {
                        table: "Min Side IDs",
                        column: "ProjectID"
                    },
                    operator: "In",
                    values: selectedProjectIds.map(Number)  // Ensure valid project IDs as numbers
                },
                {
                    $schema: "http://powerbi.com/product/schema#basic",
                    target: {
                        table: "Organization_OrgUnit",
                        column: "OrgUnitID"
                    },
                    operator: "In",
                    values: selectedOUIDs  // Ensure valid OUIDs
                }
            ];

            console.log('Applying filters:', filters);

            await reportInstance.updateFilters(window['powerbi-client'].models.FiltersOperations.Replace, filters);
            console.log('Filters updated successfully');
        } catch (error) {
            console.error('Error updating filters:', error);
        }
    } else {
        console.warn('Report instance is not available.');
    }
}





// // Adjust report container dimensions
// function adjustReportContainerDimensions() {
//     reportContainerElement.style.height = 'calc(100vh - 20px)';
//     reportContainerElement.style.padding = '0';
//     reportContainerElement.style.margin = '0';
// }


window.embedReport = embedReport;
window.updateReportFilters = updateReportFilters;

