
//------------------------------------------------------------------------------------------------------------------------------------------------------------
// Main page elements and functions ---------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------

// Function to toggle the sidebar menu open or closed
function toggleSidebar() {
    const sidebarElement = document.getElementById('sidebar');
    sidebarElement.classList.toggle('active');
}

// // Adjust report container dimensions
function adjustReportContainerDimensions() {
    reportContainerElement.style.height = 'calc(100vh - 20px)';
    reportContainerElement.style.padding = '0';
    reportContainerElement.style.margin = '0';
}

// Function to save the last accessed report ID in localStorage
function saveLastReportId(reportId) {
    localStorage.setItem('lastReportId', reportId);
}

// Fetch reports from the server and populate the report menu
async function fetchAndPopulateReports() {
    try {
        const response = await fetch('/reports');
        const reports = await response.json();

        const reportMenuElement = document.getElementById('reportMenu');
        reportMenuElement.innerHTML = ''; // Clear previous items

        reports.forEach(report => {
            const menuItemElement = document.createElement('li');
            menuItemElement.classList.add('sidebar__reportmenu-item');
            menuItemElement.innerHTML = `<a href="#" onclick="saveLastReportId('${report.id}'); embedReport('${report.id}', $('#projectFilterSelect').val())"><i class="${report.icon}"></i>${decodeURIComponent(report.name)}</a>`;
            reportMenuElement.appendChild(menuItemElement);
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------
// PowerBi rendering and functions --------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------

// Initialize the Power BI service
const powerBIService = new window['powerbi-client'].service.Service(
    window['powerbi-client'].factories.hpmFactory, 
    window['powerbi-client'].factories.wpmpFactory, 
    window['powerbi-client'].factories.routerFactory
);


const reportContainerElement = document.getElementById('reportContainer');
let reportInstance;
let currentReportPageName = null;


async function embedReport(reportId) {

    try {
        let projectFilterValues = []
        let ouidFilterValues = []
        const selectedOptions = $('#projectFilterSelect').val() || []; // Get selected options
        selectedOptions.forEach(option => {
            const parsedOption = JSON.parse(option);
            projectFilterValues = projectFilterValues.concat(parsedOption.projectIDs);
            ouidFilterValues = ouidFilterValues.concat(parsedOption.orgIDs);
        });

        if ((!projectFilterValues || projectFilterValues.length === 0)&&(!ouidFilterValues || ouidFilterValues.length === 0)) {
            projectFilterValues = getProjectAccessDetails()
                .map(project => project.projectIDs)
                .filter(projectIDs => projectIDs && projectIDs.length > 0)
                .flat();
            ouidFilterValues = getProjectAccessDetails()
                .map(project => project.orgIDs)
                .filter(orgIDs => orgIDs && orgIDs.length > 0)  // Filter out undefined or empty orgIDs
                .flat();  // Flatten the nested arrays into a single array 
        } 
        // else if ((projectFilterValues && projectFilterValues.length >= 0)&&(!ouidFilterValues || ouidFilterValues.length === 0)) {
        //     ouidFilterValues = ['empy9999999999999']
        // } 
        // else if ((ouidFilterValues && ouidFilterValues.length >= 0)&&(!projectFilterValues || projectFilterValues.length === 0)) {
        //     projectFilterValues = [9999999999999]
        // } 
 
        if (!ouidFilterValues || ouidFilterValues.length === 0) {
            ouidFilterValues = ['empy9999999999999']
        }
        if (!projectFilterValues || projectFilterValues.length === 0) {
            projectFilterValues = [9999999999999]
        }

        
        
        // Clear previous instance before embedding
        powerBIService.reset(reportContainerElement);

        const response = await fetch(`/embed-info/${reportId}`);
        const embedInfo = await response.json();

        // Extract the selected date range from the Flatpickr date picker
        const dateRangePicker = document.getElementById('monthYearRangePicker')._flatpickr;
        const selectedDates = dateRangePicker.selectedDates;

        // Format the start and end dates to the start and end of the selected months
        const currentDate = new Date();
        // let startDate = "2022-01-01T00:00:00Z"; // Default start date
        // let endDate = "2024-11-01T00:00:00Z"; // Default end date
        let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
        let endDateMinusOneMonth = new Date(endDate.getFullYear(), endDate.getMonth()-1, 1, 0, 0, 0);
        let startDate = new Date(endDateMinusOneMonth.getFullYear(), 0, 1, 0, 0, 0);

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
                values: projectFilterValues
            },
            {
                $schema: "http://powerbi.com/product/schema#basic",
                target: {
                    table: "Min Side IDs",
                    column: "OrgUnitID"
                },
                operator: "In",
                values: ouidFilterValues
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
                        value: endDate  
                    },
                    {
                        operator: "GreaterThan",
                        value: startDate  
                    }
                ]
            }
        ];

            //Sjekk ut denne !
        let filterPaneEnabledStatus = false
        let navContentPaneEnabled = false
        if (projectAccessUserRights == 'admin' || projectAccessUserRights == 'Green Norway Employed') {
            filterPaneEnabledStatus = true
            navContentPaneEnabled = true
        }
        const reportConfig = {
            type: 'report',
            tokenType: window['powerbi-client'].models.TokenType.Embed,
            accessToken: embedInfo.embedToken,
            embedUrl: embedInfo.embedUrl,
            id: embedInfo.reportId,
            filters: filters,
            settings: {
                filterPaneEnabled: filterPaneEnabledStatus,
                navContentPaneEnabled: navContentPaneEnabled,
                layoutType: 1 //3
                // Widescreen = 0	
                // Standard = 1	
                // Cortana = 2	
                // Letter = 3	
                // Custom = 4	
                // Mobile = 5
            }
        };


        // Embed the report
        reportInstance = powerBIService.embed(reportContainerElement, reportConfig);

    } catch (error) {
        console.error('Error loading report:', error);
    }
}


async function updateReportFilters(selectedProjectIds, selectedOUIDs) {
    try {
        // Extract the selected date range from the Flatpickr date picker
        const dateRangePicker = document.getElementById('monthYearRangePicker')._flatpickr;
        const selectedDates = dateRangePicker.selectedDates;

        // Format the start and end dates to the start and end of the selected months
        const currentDate = new Date();
        // let startDate = "2022-01-01T00:00:00Z"; // Default start date
        // let endDate = "2024-11-01T00:00:00Z"; // Default end date
        let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
        let endDateMinusOneMonth = new Date(endDate.getFullYear(), endDate.getMonth()-1, 1, 0, 0, 0);
        let startDate = new Date(endDateMinusOneMonth.getFullYear(), 0, 1, 0, 0, 0);

        if (selectedDates.length === 2) {
            const start = selectedDates[0];
            const end = selectedDates[1];

            startDate = new Date(start.getFullYear(), start.getMonth(), 1).toISOString();
            endDate = new Date(end.getFullYear(), end.getMonth() + 1, 0, 23, 59, 59).toISOString();
        }

        // No filtering is selected so all available ids is passed to the powerbi filter
        if ((!selectedProjectIds || selectedProjectIds.length === 0)&&(!selectedOUIDs || selectedOUIDs.length === 0)) {
            selectedProjectIds = getProjectAccessDetails()
                .map(project => project.projectIDs)
                .filter(projectIDs => projectIDs && projectIDs.length > 0)
                .flat();
            selectedOUIDs = getProjectAccessDetails()
                .map(project => project.orgIDs)
                .filter(orgIDs => orgIDs && orgIDs.length > 0)  // Filter out undefined or empty orgIDs
                .flat();  // Flatten the nested arrays into a single array
        } 
        // else if ((selectedProjectIds && selectedProjectIds.length >= 0)&&(!selectedOUIDs || selectedOUIDs.length === 0)) {
        //     selectedOUIDs = ['empy9999999999999']
        // } else if ((selectedOUIDs && selectedOUIDs.length >= 0)&&(!selectedProjectIds || selectedProjectIds.length === 0)) {
        //     selectedProjectIds = [9999999999999]
        // } 

        if (!selectedOUIDs || selectedOUIDs.length === 0) {
            selectedOUIDs = ['empy9999999999999']
        }
        if (!selectedProjectIds || selectedProjectIds.length === 0) {
            selectedProjectIds = [9999999999999]
        }


        if (reportInstance) {
            const filters = [
                {
                    $schema: "http://powerbi.com/product/schema#basic",
                    target: {
                        table: "Min Side IDs",
                        column: "ProjectID"
                    },
                    operator: "In",
                    values: selectedProjectIds  
                },
                {
                    $schema: "http://powerbi.com/product/schema#basic",
                    target: {
                        table: "Min Side IDs",
                        column: "OrgUnitID"
                    },
                    operator: "In",
                    values: selectedOUIDs 
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
        } else {
            console.warn('Report instance is not available.');
        }
    } catch (error) {
        console.error('Error updating filters:', error);
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------
// Mainpage working with Powerbi functions ---------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------

// Initialize Select2 for the project dropdown
function initializeProjectSelect() {
    $('#projectFilterSelect').select2({
        placeholder: 'Søk og velg prosjekter',
        allowClear: true,
        width: '100%'
    });
}


// // Populate the project dropdown with project names
// function populateProjectFilterDropdown(accessDetails) {
//     const projectDropdown = document.getElementById('projectFilterSelect');
//     projectDropdown.innerHTML = ''; // Clear existing options

//     accessDetails.forEach(project => {
//         const option = document.createElement('option');
//         option.value = JSON.stringify({ projectIDs: project.projectIDs, orgIDs: project.orgIDs });
//         if(project.projectIDs != "" && project.orgIDs!= ""){
//             option.text = project.name
//             option.text2= 'Eaas & Klima'
//         }else if(project.projectIDs != "" && project.orgIDs == ""){
//             option.text = project.name + ' kun Eaas'
//             option.text2= 'Eaas'
//         }else if(!project.projectIDs == "" && project.orgIDs != "") {
//             option.text = project.name + ' kun Klima'
//             option.text2= 'Klima'
//         }else{
//             option.text = project.name  + ' Ukjent';
//         }
//         // option.text = project.name;
//         projectDropdown.appendChild(option);
//     });
// }
// Populate the project dropdown with project names grouped by category
function populateProjectFilterDropdown(accessDetails) {
    const projectDropdown = document.getElementById('projectFilterSelect');
    projectDropdown.innerHTML = ''; // Clear existing options

    // Group projects by category
    const groupedProjects = {
        'Eaas & Klima': [],
        'Eaas': [],
        'Klima': [],
        'Other': []
    };

    accessDetails.forEach(project => {
        if (project.projectIDs != "" && project.orgIDs!= "") {
            groupedProjects['Eaas & Klima'].push(project);
        } else if (project.projectIDs != "" && project.orgIDs == "") {
            groupedProjects['Eaas'].push(project);
        } else if (!project.projectIDs == "" && project.orgIDs != "") {
            groupedProjects['Klima'].push(project);
        } else {
            groupedProjects['Other'].push(project);
        }
    });

    // Create optgroups and append options
    Object.keys(groupedProjects).forEach(category => {
        if (groupedProjects[category].length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category;

            groupedProjects[category].forEach(project => {
                const option = document.createElement('option');
                option.value = JSON.stringify({ projectIDs: project.projectIDs, orgIDs: project.orgIDs });
                option.text = project.name;
                optgroup.appendChild(option);
            });

            projectDropdown.appendChild(optgroup);
        }
    });
}


// Function to apply the selected project filters
function applyProjectFilter() {
    const selectedOptions = $('#projectFilterSelect').val() || []; // Get selected options

    let selectedProjectIds = [];
    let selectedOUIDs = [];

    selectedOptions.forEach(option => {
        const parsedOption = JSON.parse(option);
        selectedProjectIds = selectedProjectIds.concat(parsedOption.projectIDs);
        selectedOUIDs = selectedOUIDs.concat(parsedOption.orgIDs);
    });

    // Remove duplicates
    selectedProjectIds = [...new Set(selectedProjectIds)];
    selectedOUIDs = [...new Set(selectedOUIDs)];


    if (reportInstance) {
        reportInstance.getActivePage().then(page => {
            currentReportPageName = page.name;
            updateReportFilters(selectedProjectIds, selectedOUIDs);
        }).catch(error => {
            console.error('Error getting current page:', error);
        });
    } else {
        embedReport('196ff37e-8fba-445d-81bc-bbc4db1b0574', selectedProjectIds, selectedOUIDs);
    }
}

// Function to get the current project filter value from the dropdown
function getCurrentProjectFilterValue() {
    const projectDropdown = document.getElementById('projectFilterSelect');
    return [projectDropdown.value];
}

// Function to return project access details
// projectAccessDetails is beeing returned at the dashboard.hbs and through the routes,
function getProjectAccessDetails() {
    return Array.isArray(projectAccessDetails) ? projectAccessDetails : [];
    }












// Initialize the application on window load
window.onload = function() {
    fetch('/config')
        .then(response => response.json())
        .then(config => {
            const REPORT_1_ID = config.report1Id;

            // Fetch and populate the reports
            fetchAndPopulateReports();

            const lastReportId = localStorage.getItem('lastReportId') || REPORT_1_ID;
            embedReport(lastReportId);

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
window.toggleSidebar = toggleSidebar;
window.applyProjectFilter = applyProjectFilter;
window.saveLastReportId = saveLastReportId;
window.embedReport = embedReport;
window.updateReportFilters = updateReportFilters;
window.getProjectAccessDetails = getProjectAccessDetails;
window.getCurrentProjectFilterValue = getCurrentProjectFilterValue;