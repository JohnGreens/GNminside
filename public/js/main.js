// Function to apply the selected project filters
function applyProjectFilter() {
    const selectedProjectIds = $('#projectFilterSelect').val();

    // Extract the OUIDs corresponding to the selected projects
    
    const selectedOUIDs = getProjectAccessDetails()
        .filter(project => selectedProjectIds.includes(project.projectID.toString()))
        .map(project => project.orgID)
        .filter(id => id !== null);  // Filter out null OUIDs
   

    if (reportInstance) {
        reportInstance.getActivePage().then(page => {
            currentReportPageName = page.name;  // Capture the current page name
            console.log('Current Page before applying filters:', currentReportPageName);  // Log current page

            // Update filters without re-rendering the report
            updateReportFilters(selectedProjectIds, selectedOUIDs);
        }).catch(error => {
            console.error('Error getting current page:', error);
        });
    } else {
        console.warn('Report instance not available, embedding report with selected filters.');  // Log warning
        const lastReportId = localStorage.getItem('lastReportId') || 'REPORT_1_ID';
        embedReport(lastReportId, selectedProjectIds, selectedOUIDs);
    }
}

// Function to save the last accessed report ID
function saveLastReportId(reportId) {
    localStorage.setItem('lastReportId', reportId);
 
}


// Function to toggle the sidebar menu open or closed
function toggleSidebar() {
    const sidebarElement = document.getElementById('sidebar');
    sidebarElement.classList.toggle('active');
    // console.log('Sidebar toggled. Active state:', sidebarElement.classList.contains('active'));  // Debugging log
}




// Fetch reports from the server and populate the report menu
async function fetchAndPopulateReports() {
    const response = await fetch('/reports');
    const reports = await response.json();

    const reportMenuElement = document.getElementById('reportMenu');
    reportMenuElement.innerHTML = ''; // Clear previous items

    reports.forEach(report => {
        const menuItemElement = document.createElement('li');
        menuItemElement.classList.add('sidebar__menu-item');
        menuItemElement.innerHTML = `<a href="#" onclick="saveLastReportId('${report.id}'); embedReport('${report.id}', $('#projectFilterSelect').val())"><i class="${report.icon}"></i>${report.name}</a>`;
        reportMenuElement.appendChild(menuItemElement);
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

// Initialize Select2 for the project dropdown
function initializeProjectSelect() {
    $('#projectFilterSelect').select2({
        placeholder: 'Søk og velg prosjekter',
        allowClear: true,
        width: '100%'
    });
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
window.toggleSidebar = toggleSidebar;
window.applyProjectFilter = applyProjectFilter;
// window.navigateReportPage = navigateReportPage;
window.saveLastReportId = saveLastReportId;
