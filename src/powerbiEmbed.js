const {getProjectAccessDetails} = require('./accessIDhandler');
// Initialize the Power BI service
const powerBIService = new window['powerbi-client'].service.Service(
    window['powerbi-client'].factories.hpmFactory, 
    window['powerbi-client'].factories.wpmpFactory, 
    window['powerbi-client'].factories.routerFactory
);

const reportContainerElement = document.getElementById('reportContainer');
let reportInstance;


// Function to embed a Power BI report with the given filters
function embedReport(reportId, projectFilterValues = []) {
    // Default to all projects and OUIDs if no specific filters are provided
    if (!projectFilterValues || projectFilterValues.length === 0) {
        projectFilterValues = getProjectAccessDetails().map(project => project.projectId);
        // console.log('No specific project filters provided, applying all project IDs:', projectFilterValues);  // Debugging log
    }

    // Extract the OUIDs from projectAccessDetails
    const ouidFilterValues = getProjectAccessDetails().map(project => project.OUID);
    // console.log('Applying OUIDs on first render:', ouidFilterValues);  // Debugging log

    // console.log('Embedding report with Project IDs:', projectFilterValues, 'and OUIDs:', ouidFilterValues);  // Log filters being applied

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
                        table: "Min Side IDs",
                        column: "OrgUnitID"
                    },
                    operator: "In",
                    values: ouidFilterValues  // Apply OUIDs directly
                }
                // ,
                // {
                //     $schema: "http://powerbi.com/product/schema#basic",
                //     target: {
                //         table: "Min Side Periode",
                //         column: "DateTime" //datetime object
                //     },
                //     operator: "In",
                //     values: ouidFilterValues  // Apply OUIDs directly TIDSPUNKT Sliser med 
                // }

            ];

            const reportConfig = {
                type: 'report',
                tokenType: window['powerbi-client'].models.TokenType.Embed,
                accessToken: embedInfo.embedToken,
                embedUrl: embedInfo.embedUrl,
                id: embedInfo.reportId,
                filters: filters,
                settings: {
                    filterPaneEnabled: false,
                    navContentPaneEnabled: false,
                    layoutType: 3
                }
            };

            // Embed the report
            reportInstance = powerBIService.embed(reportContainerElement, reportConfig);

            // // Handle report loaded event
            // reportInstance.on('loaded', async () => {
            //     try {
            //         adjustReportContainerDimensions();
            //         window.addEventListener('resize', adjustReportContainerDimensions);

            //         // // Populate page selector with report pages
            //         // const reportPages = await reportInstance.getPages();
            //         // populatePageDropdown(reportPages);  // Populate the dropdown with pages

            //        // // Re-apply the captured page after the report is loaded
            //         // if (currentReportPageName) {
            //         //     const page = reportPages.find(p => p.name === currentReportPageName);
            //         //     if (page) {
            //         //         await reportInstance.setPage(page.name);
            //         //         console.log('Re-applying page:', page.name);  // Log the page being re-applied
            //         //     } else {
            //         //         console.warn('The previous page was not found in the report.');
            //         //     }
            //         // }

            //         // // Ensure page navigation works after embedding
            //         // document.getElementById('reportPageSelect').addEventListener('change', navigateReportPage);
            //     } catch (error) {
            //         console.error('Error navigating to the page:', error);
            //     }
            // });
        })
        .catch(error => {
            console.error('Error loading report:', error);
        });
}




// Function to update filters without re-rendering the report
async function updateReportFilters(selectedProjectIds, selectedOUIDs) {
    // console.log('Updating report filters with Project IDs:', selectedProjectIds, 'and OUIDs:', selectedOUIDs);  // Debugging log

    if (!selectedProjectIds || selectedProjectIds.length === 0) {
        // If no projects are selected, apply all available project IDs
        selectedProjectIds = getProjectAccessDetails().map(project => project.projectId);
        // console.log('No projects selected, applying all projects:', selectedProjectIds);  // Debugging log
    }

    if (!selectedOUIDs || selectedOUIDs.length === 0) {
        // If no OUIDs are selected, apply all available OUIDs
        selectedOUIDs = getProjectAccessDetails().map(project => project.OUID);
        // console.log('No OUIDs selected, applying all OUIDs:', selectedOUIDs);  // Debugging log
    }

    if (reportInstance) {
        try {
            // Define the new filters
            const filters = [
                {
                    $schema: "http://powerbi.com/product/schema#basic",
                    target: {
                        table: "Min Side IDs",
                        column: "ProjectID"
                    },
                    operator: "In",
                    values: selectedProjectIds.map(Number)  // Ensure filter values are numbers
                },
                {
                    $schema: "http://powerbi.com/product/schema#basic",
                    target: {
                        table: "Organization_OrgUnit",
                        column: "OrgUnitID"
                    },
                    operator: "In",
                    values: selectedOUIDs  // Apply OUIDs directly
                }
            ];

            // Apply the filters to the report
            await reportInstance.updateFilters(window['powerbi-client'].models.FiltersOperations.Replace, filters);
            // console.log('Filters updated successfully:', filters);  // Log success
        } catch (error) {
            console.error('Error updating filters:', error);  // Log any errors
        }
    } else {
        console.warn('Report instance is not available.');  // Warn if report instance is not found
    }
}




// // Adjust report container dimensions
// function adjustReportContainerDimensions() {
//     reportContainerElement.style.height = 'calc(100vh - 20px)';
//     reportContainerElement.style.padding = '0';
//     reportContainerElement.style.margin = '0';
// }


// window.embedReport = embedReport;
// window.updateReportFilters = updateReportFilters;

module.exports = {
    embedReport:embedReport,
    updateReportFilters:updateReportFilters,
    reportInstance:reportInstance
}