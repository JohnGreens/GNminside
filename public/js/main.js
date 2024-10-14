// //------------------------------------------------------------------------------------------------------------------------------------------------------------
// //Main page elements and functions ---------------------------------------------------------------------------------------------------------------------------
// //------------------------------------------------------------------------------------------------------------------------------------------------------------


// // Function to toggle the sidebar menu open or closed
// function toggleSidebar() {
//     const sidebarElement = document.getElementById('sidebar');
//     sidebarElement.classList.toggle('active');
//     // console.log('Sidebar toggled. Active state:', sidebarElement.classList.contains('active'));  // Debugging log
// }

// // Fetch reports from the server and populate the report menu
// async function fetchAndPopulateReports() {
//     const response = await fetch('/reports');
//     const reports = await response.json();

//     const reportMenuElement = document.getElementById('reportMenu');
//     reportMenuElement.innerHTML = ''; // Clear previous items

//     reports.forEach(report => {
//         const menuItemElement = document.createElement('li');
//         menuItemElement.classList.add('sidebar__menu-item');
//         menuItemElement.innerHTML = `<a href="#" onclick="saveLastReportId('${report.id}'); embedReport('${report.id}', $('#projectFilterSelect').val())"><i class="${report.icon}"></i>${report.name}</a>`;
//         reportMenuElement.appendChild(menuItemElement);
//     });
// }



// //------------------------------------------------------------------------------------------------------------------------------------------------------------
// //PowerBi rendering and functions --------------------------------------------------------------------------------------------------------------------------
// //------------------------------------------------------------------------------------------------------------------------------------------------------------

// // Initialize the Power BI service
// const powerBIService = new window['powerbi-client'].service.Service(
//     window['powerbi-client'].factories.hpmFactory, 
//     window['powerbi-client'].factories.wpmpFactory, 
//     window['powerbi-client'].factories.routerFactory
// );

// const reportContainerElement = document.getElementById('reportContainer');
// let reportInstance;
// let currentReportPageName = null;

// // Function to embed a Power BI report with the given filters
// function embedReport(reportId, projectFilterValues = []) {

//     // Default to all projects and OUIDs if no specific filters are provided
//     if (!projectFilterValues || projectFilterValues.length === 0) {
//         projectFilterValues = getProjectAccessDetails().map(project => project.projectID);
//     }

//     // Extract the OUIDs from projectAccessDetails
//     const ouidFilterValues = getProjectAccessDetails().map(project => project.orgID);

//     // Clear previous instance before embedding
//     powerBIService.reset(reportContainerElement);

//     fetch(`/embed-info/${reportId}`)
//         .then(response => response.json())
//         .then(embedInfo => {
//             const filters = [
//                 {
//                     $schema: "http://powerbi.com/product/schema#basic",
//                     target: {
//                         table: "Min Side IDs",
//                         column: "ProjectID"
//                     },
//                     operator: "In",
//                     values: projectFilterValues.map(Number)  // Ensure filter values are numbers
//                 },
//                 {
//                     $schema: "http://powerbi.com/product/schema#basic",
//                     target: {
//                         table: "Organization_OrgUnit",
//                         column: "OrgUnitID"
//                     },
//                     operator: "In",
//                     values: ouidFilterValues.filter(id => id !== null)
//                 },
//                 // {
//                 //     $schema: "http://powerbi.com/product/schema#basic",
//                 //     target: {
//                 //         table: "Min Side Period",
//                 //         column: "År" //datetime object
//                 //     },
//                 //     operator: "In",
//                 //     values: [2024]  // Apply OUIDs directly TIDSPUNKT Sliser med
//                 // },
//                 // {
//                 //     $schema: "http://powerbi.com/product/schema#basic",
//                 //     target: {
//                 //         table: "Min Side Period",
//                 //         column: "Måned" //datetime object
//                 //     },
//                 //     operator: "In",
//                 //     values: 12  // Apply OUIDs directly TIDSPUNKT Sliser med
//                 // },
//                 {
//                     $schema: "https://powerbi.com/product/schema#advanced",
//                     target: {
//                         table: "Min Side Period",
//                         column: "DateTime"
//                     },
//                     logicalOperator: "And",
//                     conditions: [
//                         {
//                             operator: "LessThan",
//                             value: "2024-01-01T00:00:00Z"  // ISO 8601 format for the upper bound
//                         },
//                         {
//                             operator: "GreaterThan",
//                             value: "2023-05-01T00:00:00Z"  // ISO 8601 format for the lower bound
//                         }
//                     ]
//                 }
//             ];

//             const reportConfig = {
//                 type: 'report',
//                 tokenType: window['powerbi-client'].models.TokenType.Embed,
//                 accessToken: embedInfo.embedToken,
//                 embedUrl: embedInfo.embedUrl,
//                 id: embedInfo.reportId,
//                 filters: filters,
//                 settings: {
//                     filterPaneEnabled: true,
//                     navContentPaneEnabled: false,
//                     layoutType: 3
//                 }
//             };

//             // Embed the report
//             reportInstance = powerBIService.embed(reportContainerElement, reportConfig);
//         })
//         .catch(error => {
//             console.error('Error loading report:', error);
//         });
// }








// // Function to update filters without re-rendering the report
// async function updateReportFilters(selectedProjectIds, selectedOUIDs) {
//     // console.log('Updating report filters with Project IDs:', selectedProjectIds, 'and OUIDs:', selectedOUIDs);

//     // Check if no selections were made
//     if (!selectedProjectIds || selectedProjectIds.length === 0) {
//         selectedProjectIds = getProjectAccessDetails()
//             .map(project => project.projectID)
//             .filter(id => id !== null && id !== undefined && !isNaN(id));  // Filter out invalid project IDs
//         // console.log('No projects selected, applying all valid project IDs:', selectedProjectIds);
//     }

//     if (!selectedOUIDs || selectedOUIDs.length === 0) {
//         selectedOUIDs = getProjectAccessDetails()
//             .map(project => project.orgID)
//             .filter(id => id !== null && id !== undefined && !isNaN(id));  // Filter out invalid OUIDs
//         // console.log('No OUIDs selected, applying all valid OUIDs:', selectedOUIDs);
//     }

//     if (reportInstance) {
//         try {
//             const filters = [
//                 {
//                     $schema: "http://powerbi.com/product/schema#basic",
//                     target: {
//                         table: "Min Side IDs",
//                         column: "ProjectID"
//                     },
//                     operator: "In",
//                     values: selectedProjectIds.map(Number)  // Ensure valid project IDs as numbers
//                 },
//                 {
//                     $schema: "http://powerbi.com/product/schema#basic",
//                     target: {
//                         table: "Organization_OrgUnit",
//                         column: "OrgUnitID"
//                     },
//                     operator: "In",
//                     values: selectedOUIDs  // Ensure valid OUIDs
//                 }
//             ];

//             // console.log('Applying filters:', filters);

//             await reportInstance.updateFilters(window['powerbi-client'].models.FiltersOperations.Replace, filters);
//             // console.log('Filters updated successfully');
//         } catch (error) {
//             console.error('Error updating filters:', error);
//         }
//     } else {
//         console.warn('Report instance is not available.');
//     }
// }





// // // Adjust report container dimensions
// // function adjustReportContainerDimensions() {
// //     reportContainerElement.style.height = 'calc(100vh - 20px)';
// //     reportContainerElement.style.padding = '0';
// //     reportContainerElement.style.margin = '0';
// // }




// //------------------------------------------------------------------------------------------------------------------------------------------------------------
// //Mainpage working with Powerbi functions ---------------------------------------------------------------------------------------------------------------------------
// //------------------------------------------------------------------------------------------------------------------------------------------------------------

// // Initialize Select2 for the project dropdown
// function initializeProjectSelect() {
//     $('#projectFilterSelect').select2({
//         placeholder: 'Søk og velg prosjekter',
//         allowClear: true,
//         width: '100%'
//     });
// }

// // Populate the project dropdown with project names
// function populateProjectFilterDropdown(accessDetails) {
//     const projectDropdown = document.getElementById('projectFilterSelect');
//     projectDropdown.innerHTML = ''; // Clear existing options

//     accessDetails.forEach(project => {
//         const option = document.createElement('option');
//         option.value = project.projectID;
//         option.text = project.name;
//         projectDropdown.appendChild(option);
//     });
// }


// // Function to apply the selected project filters
// function applyProjectFilter() {
//     const selectedProjectIds = $('#projectFilterSelect').val();

//     // Extract the OUIDs corresponding to the selected projects
    
//     const selectedOUIDs = getProjectAccessDetails()
//         .filter(project => selectedProjectIds.includes(project.projectID.toString()))
//         .map(project => project.orgID)
//         .filter(id => id !== null);  // Filter out null OUIDs
   

//     if (reportInstance) {
//         reportInstance.getActivePage().then(page => {
//             currentReportPageName = page.name;  // Capture the current page name
//             // console.log('Current Page before applying filters:', currentReportPageName);  // Log current page

//             // Update filters without re-rendering the report
//             updateReportFilters(selectedProjectIds, selectedOUIDs);
//         }).catch(error => {
//             console.error('Error getting current page:', error);
//         });
//     } else {
//         console.warn('Report instance not available, embedding report with selected filters.');  // Log warning
//         const lastReportId = localStorage.getItem('lastReportId') || 'REPORT_1_ID';
//         embedReport(lastReportId, selectedProjectIds, selectedOUIDs);
//     }
// }


// // Function to apply the selected project filters
// function applyProjectFilter() {
//     const selectedProjectIds = $('#projectFilterSelect').val() || []; // Get selected project IDs

//     // Filter out any invalid or 'null' project IDs and NaN values
//     const validProjectIds = selectedProjectIds.filter(id => id !== 'null' && id !== null && id !== undefined && !isNaN(id));

//     // console.log('applyProjectFilter called. Valid Selected Project IDs:', validProjectIds);

//     // Filter projects by selected project IDs and extract corresponding OUIDs
//     const selectedOUIDs = getProjectAccessDetails()
//         .filter(project => validProjectIds.includes(project.projectID ? project.projectID.toString() : null))
//         .map(project => project.orgID)
//         .filter(id => id !== null && id !== undefined && id !== 'null' && !isNaN(id));

//     if (reportInstance) {
//         reportInstance.getActivePage().then(page => {
//             currentReportPageName = page.name;
//             updateReportFilters(validProjectIds, selectedOUIDs);
//         }).catch(error => {
//             console.error('Error getting current page:', error);
//         });
//     } else {
//         embedReport('196ff37e-8fba-445d-81bc-bbc4db1b0574', validProjectIds, selectedOUIDs);
//     }
// }

// // Function to get the current project filter value from the dropdown
// function getCurrentProjectFilterValue() {
//     const projectDropdown = document.getElementById('projectFilterSelect');
//     return [projectDropdown.value];
// }



// // Function to save the last accessed report ID
// function saveLastReportId(reportId) {
//     localStorage.setItem('lastReportId', reportId);
 
// }






  
// // Function to return project access details
// // projectAccessDetails is beeing returned at the dashboard.hbs and through the routes
// function getProjectAccessDetails() {
//     return Array.isArray(projectAccessDetails) ? projectAccessDetails : [];
// }





// // Initialize the application on window load
// window.onload = function() {
//     fetch('/config')
//         .then(response => response.json())
//         .then(config => {
//             const REPORT_1_ID = config.report1Id;

//             // Fetch and populate the reports
//             fetchAndPopulateReports();

//             const lastReportId = localStorage.getItem('lastReportId') || REPORT_1_ID;
//             embedReport(lastReportId, []);

//             const accessDetails = getProjectAccessDetails(); 
//             populateProjectFilterDropdown(accessDetails);
//             initializeProjectSelect();

//             $('#projectFilterSelect').on('change', applyProjectFilter);
//         })
//         .catch(error => {
//             console.error('Error fetching REPORT_1_ID from server:', error);
//         });
// }



// // Make functions available globally
// // window.toggleSidebar = toggleSidebar;
// // window.applyProjectFilter = applyProjectFilter;
// // window.saveLastReportId = saveLastReportId;
// // window.embedReport = embedReport;
// // window.updateReportFilters = updateReportFilters;
// // window.applyProjectFilter = applyProjectFilter;
// // window.getProjectAccessDetails = getProjectAccessDetails
// // window.getCurrentProjectFilterValue = getCurrentProjectFilterValue;




// TEST NY GIT 

//------------------------------------------------------------------------------------------------------------------------------------------------------------
//Main page elements and functions ---------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------


// Function to toggle the sidebar menu open or closed
function toggleSidebar() {
    const sidebarElement = document.getElementById('sidebar');
    sidebarElement.classList.toggle('active');
    // console.log('Sidebar toggled. Active state:', sidebarElement.classList.contains('active'));  // Debugging log
}



// Function to save the last accessed report ID in localStorage
function saveLastReportId(reportId) {
    localStorage.setItem('lastReportId', reportId);
}
// // Fetch reports from the server and populate the report menu
// async function fetchAndPopulateReports() {
//     const response = await fetch('/reports');
//     const reports = await response.json();

//     const reportMenuElement = document.getElementById('reportMenu');
//     reportMenuElement.innerHTML = ''; // Clear previous items

//     reports.forEach(report => {
//         const menuItemElement = document.createElement('li');
//         menuItemElement.classList.add('sidebar__menu-item');
//         menuItemElement.innerHTML = `<a href="#" onclick="saveLastReportId('${report.id}'); embedReport('${report.id}', $('#projectFilterSelect').val())"><i class="${report.icon}"></i>${report.name}</a>`;
//         reportMenuElement.appendChild(menuItemElement);
//     });
// }


window.saveLastReportId = saveLastReportId;

//------------------------------------------------------------------------------------------------------------------------------------------------------------
//PowerBi rendering and functions --------------------------------------------------------------------------------------------------------------------------

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
            // Extract the selected date range from the Flatpickr date picker
            const dateRangePicker = document.getElementById('monthYearRangePicker')._flatpickr;
            const selectedDates = dateRangePicker.selectedDates;

            // Format the start and end dates to the start and end of the selected months
            let startDate = "2023-05-01T00:00:00Z"; // Default start date
            let endDate = "2024-01-01T00:00:00Z"; // Default end date

            if (selectedDates.length === 2) {
                const start = selectedDates[0];
                const end = selectedDates[1];

                startDate = new Date(start.getFullYear(), start.getMonth(), 1).toISOString();
                endDate = new Date(end.getFullYear(), end.getMonth() + 1, 0, 23, 59, 59).toISOString();
            }

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
                },
                {
                    $schema: "https://powerbi.com/product/schema#advanced",
                    target: {
                        table: "Min Side Period",
                        column: "DateTime"
                    },
                    logicalOperator: "And",
                    conditions: [
                        {
                            operator: "LessThan",
                            value: endDate  // ISO 8601 format for the upper bound
                        },
                        {
                            operator: "GreaterThan",
                            value: startDate  // ISO 8601 format for the lower bound
                        }
                    ]
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
    // Extract the selected date range from the Flatpickr date picker
    const dateRangePicker = document.getElementById('monthYearRangePicker')._flatpickr;
    const selectedDates = dateRangePicker.selectedDates;

    // Format the start and end dates to the start and end of the selected months
    let startDate = "2023-05-01T00:00:00Z"; // Default start date
    let endDate = "2024-01-01T00:00:00Z"; // Default end date

    if (selectedDates.length === 2) {
        const start = selectedDates[0];
        const end = selectedDates[1];

        startDate = new Date(start.getFullYear(), start.getMonth(), 1).toISOString();
        endDate = new Date(end.getFullYear(), end.getMonth() + 1, 0, 23, 59, 59).toISOString();
    }

    // Check if no selections were made
    if (!selectedProjectIds || selectedProjectIds.length === 0) {
        selectedProjectIds = getProjectAccessDetails()
            .map(project => project.projectID)
            .filter(id => id !== null && id !== undefined && !isNaN(id));  // Filter out invalid project IDs
    }

    if (!selectedOUIDs || selectedOUIDs.length === 0) {
        selectedOUIDs = getProjectAccessDetails()
            .map(project => project.orgID)
            .filter(id => id !== null && id !== undefined && !isNaN(id));  // Filter out invalid OUIDs
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
                },
                {
                    $schema: "https://powerbi.com/product/schema#advanced",
                    target: {
                        table: "Min Side Period",
                        column: "DateTime"
                    },
                    logicalOperator: "And",
                    conditions: [
                        {
                            operator: "LessThan",
                            value: endDate  // ISO 8601 format for the upper bound
                        },
                        {
                            operator: "GreaterThan",
                            value: startDate  // ISO 8601 format for the lower bound
                        }
                    ]
                }
            ];

            await reportInstance.updateFilters(window['powerbi-client'].models.FiltersOperations.Replace, filters);
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

//------------------------------------------------------------------------------------------------------------------------------------------------------------
//Mainpage working with Powerbi functions ---------------------------------------------------------------------------------------------------------------------------

// Initialize Select2 for the project dropdown
function initializeProjectSelect() {
    $('#projectFilterSelect').select2({
        placeholder: 'Søk og velg prosjekter',
        allowClear: true,
        width: '100%'
    });
}

// Populate the project dropdown with project names
function populateProjectFilterDropdown(accessDetails) {
    const projectDropdown = document.getElementById('projectFilterSelect');
    projectDropdown.innerHTML = ''; // Clear existing options

    accessDetails.forEach(project => {
        const option = document.createElement('option');
        option.value = project.projectID;
        option.text = project.name;
        projectDropdown.appendChild(option);
    });
}

// Function to apply the selected project filters
function applyProjectFilter() {
    const selectedProjectIds = $('#projectFilterSelect').val() || []; // Get selected project IDs

    // Filter out any invalid or 'null' project IDs and NaN values
    const validProjectIds = selectedProjectIds.filter(id => id !== 'null' && id !== null && id !== undefined && !isNaN(id));

    // console.log('applyProjectFilter called. Valid Selected Project IDs:', validProjectIds);

    // Filter projects by selected project IDs and extract corresponding OUIDs
    const selectedOUIDs = getProjectAccessDetails()
        .filter(project => validProjectIds.includes(project.projectID ? project.projectID.toString() : null))
        .map(project => project.orgID)
        .filter(id => id !== null && id !== undefined && id !== 'null' && !isNaN(id));

    if (reportInstance) {
        reportInstance.getActivePage().then(page => {
            currentReportPageName = page.name;
            updateReportFilters(validProjectIds, selectedOUIDs);
        }).catch(error => {
            console.error('Error getting current page:', error);
        });
    } else {
        embedReport('196ff37e-8fba-445d-81bc-bbc4db1b0574', validProjectIds, selectedOUIDs);
    }
}

// Function to get the current project filter value from the dropdown
function getCurrentProjectFilterValue() {
    const projectDropdown = document.getElementById('projectFilterSelect');
    return [projectDropdown.value];
}

// Function to save the last accessed report ID
function saveLastReportId(reportId) {
    localStorage.setItem('lastReportId', reportId);
}

// Function to return project access details
// projectAccessDetails is beeing returned at the dashboard.hbs and through the routes
function getProjectAccessDetails() {
    return Array.isArray(projectAccessDetails) ? projectAccessDetails : [];
}

// Initialize the application on window load
window.onload = function() {
    fetch('/config')
        .then(response => response.json())
        .then(config => {
            const REPORT_1_ID = config.report1Id;

            const lastReportId = localStorage.getItem('lastReportId') || REPORT_1_ID;
            embedReport(lastReportId, []);

            const accessDetails = getProjectAccessDetails(); 
            populateProjectFilterDropdown(accessDetails);
            initializeProjectSelect();

            $('#projectFilterSelect').on('change', applyProjectFilter);
        })
        .catch(error => {
            console.error('Error fetching REPORT_1_ID from server:', error);
        });
}

// Make functions available globally
// window.toggleSidebar = toggleSidebar;
// window.applyProjectFilter = applyProjectFilter;
// window.saveLastReportId = saveLastReportId;
// window.embedReport = embedReport;
// window.updateReportFilters = updateReportFilters;
// window.applyProjectFilter = applyProjectFilter;
// window.getProjectAccessDetails = getProjectAccessDetails
// window.getCurrentProjectFilterValue = getCurrentProjectFilterValue;