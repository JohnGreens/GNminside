const {embedReport,updateReportFilters,reportInstance} = require('./powerbiEmbed');
// Function to apply the selected project filters
let currentReportPageName = null;
function applyProjectFilter() {
    const selectedProjectIds = $('#projectFilterSelect').val();
    // console.log('applyProjectFilter called. Selected Project IDs:', selectedProjectIds);  // Debugging log

    if (reportInstance) {
        reportInstance.getActivePage().then(page => {
            currentReportPageName = page.name;  // Capture the current page name
            // console.log('Current Page before applying filters:', currentReportPageName);  // Log current page

            // Update filters without re-rendering the report
            updateReportFilters(selectedProjectIds);
        }).catch(error => {
            console.error('Error getting current page:', error);
        });
    } else {
        console.warn('Report instance not available, embedding report with selected filters.');  // Log warning
        embedReport('196ff37e-8fba-445d-81bc-bbc4db1b0574', selectedProjectIds);
    }
}


// Function to get the current project filter value from the dropdown
function getCurrentProjectFilterValue() {
    const projectDropdown = document.getElementById('projectFilterSelect');
    return [projectDropdown.value];
}

module.exports = {
    applyProjectFilter:applyProjectFilter,
    getCurrentProjectFilterValue:getCurrentProjectFilterValue
}