
// Function to apply the selected project filters
function applyProjectFilter() {
    const selectedProjectIds = $('#projectFilterSelect').val() || []; // Get selected project IDs

    // Filter out any invalid or 'null' project IDs and NaN values
    const validProjectIds = selectedProjectIds.filter(id => id !== 'null' && id !== null && id !== undefined && !isNaN(id));

    console.log('applyProjectFilter called. Valid Selected Project IDs:', validProjectIds);

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

window.applyProjectFilter = applyProjectFilter;
window.getCurrentProjectFilterValue = getCurrentProjectFilterValue;

