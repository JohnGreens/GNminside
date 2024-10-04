const {getProjectAccessDetails} = require('./accessIDhandler');
const {embedReport,updateReportFilters,reportInstance} = require('./powerbiEmbed');
// Function to apply the selected project filters
function applyProjectFilter() {
    const selectedProjectIds = $('#projectFilterSelect').val();
    console.log('applyProjectFilter called. Selected Project IDs:', selectedProjectIds);  // Debugging log

    // Extract the OUIDs corresponding to the selected projects
    let selectedOUIDs = [];
    if (selectedProjectIds && selectedProjectIds.length > 0) {
        selectedOUIDs = getProjectAccessDetails()
            .filter(project => selectedProjectIds.includes(project.projectId.toString()))
            .map(project => project.OUID);
    } else {
        // If no projects are selected, apply all OUIDs
        selectedOUIDs = getProjectAccessDetails().map(project => project.OUID);
    }
    console.log('Selected OUIDs based on selected projects:', selectedOUIDs);  // Debugging log

    if (reportInstance) {
        reportInstance.getActivePage().then(page => {
            // currentReportPageName = page.name;  // Capture the current page name
            // console.log('Current Page before applying filters:', currentReportPageName);  // Log current page

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
    console.log('Last accessed report ID saved:', reportId);  // Debugging log
}

// Fetch reports from the server and populate the report menu
async function fetchAndPopulateReports() {
    const response = await fetch('/reports');
    const reports = await response.json();
    console.log('Reports fetched:', reports);  // Debugging log

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
function populateProjectFilterDropdown(projects) {
    const projectDropdown = $('#projectFilterSelect');
    projectDropdown.empty(); // Clear previous options
    console.log('Populating project dropdown with:', projects);  // Debugging log
    projects.forEach(project => {
        projectDropdown.append(new Option(project.projectName, project.projectId));
    });
}

// Initialize Select2 for the project dropdown
function initializeProjectSelect() {
    $('#projectFilterSelect').select2({
        placeholder: 'Search and select projects',
        allowClear: true,
        width: '100%'
    });
    console.log('Select2 initialized for project dropdown');  // Debugging log
}

// Initialize the application on window load
window.onload = function() {
    console.log('Window loaded. Initializing application...');  // Debugging log

    // Fetch the REPORT_1_ID from the server
    fetch('/config')
        .then(response => response.json())
        .then(config => {
            const REPORT_1_ID = config.report1Id;
            console.log('Using REPORT_1_ID from config:', REPORT_1_ID);  // Debugging log

            // Fetch and populate the reports
            fetchAndPopulateReports();

            // Load the last accessed report if available, otherwise default to REPORT_1_ID
            const lastReportId = localStorage.getItem('lastReportId') || REPORT_1_ID;
            console.log('Loading last accessed report or default:', lastReportId);  // Debugging log

            // Embed the initial report with default filters (all projects and OUIDs)
            embedReport(lastReportId, []);

            // Populate the project filter dropdown
            const accessDetails = getProjectAccessDetails();
            console.log('Access Details:', accessDetails);  // Debugging log
            populateProjectFilterDropdown(accessDetails);
            initializeProjectSelect();

            // Attach the applyProjectFilter function to the Select2 change event
            $('#projectFilterSelect').on('change', applyProjectFilter);
            console.log('Event listener attached to project dropdown');  // Debugging log
        })
        .catch(error => {
            console.error('Error fetching REPORT_1_ID from server:', error);
        });
}

// Function to toggle the sidebar menu
function toggleSidebar() {
    const sidebarElement = document.getElementById('sidebar');
    sidebarElement.classList.toggle('active');
    console.log('Sidebar toggled. Active state:', sidebarElement.classList.contains('active'));  // Debugging log
}

// Make functions available globally
// window.toggleSidebar = toggleSidebar;
// window.applyProjectFilter = applyProjectFilter;
// // window.navigateReportPage = navigateReportPage;
// window.saveLastReportId = saveLastReportId;

module.exports = {
    toggleSidebar:toggleSidebar,
    applyProjectFilter:applyProjectFilter,
    saveLastReportId:saveLastReportId
}