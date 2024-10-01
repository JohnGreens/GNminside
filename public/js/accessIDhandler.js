// Array holding project information with access details
const projectAccessDetails = [
    { projectId: 221073, projectName: "Comfort Hotel Kristiansand",OUID:"OUID1000032" },
    { projectId: 221010, projectName: "Futurum AS",OUID:"OUID1000032" },
    { projectId: 211012, projectName: "Got Marine" ,OUID:"OUID1000032"},
    { projectId: 221046, projectName: "Hemsedal Veksthus AS",OUID:"OUID1000033" },
    { projectId: 211022, projectName: "Krokatjønn Bergen",OUID:"OUID1000042" }
];

// Function to retrieve the project access details
function getProjectAccessDetails() {
    return projectAccessDetails;
}

// Make the function available globally
window.getProjectAccessDetails = getProjectAccessDetails;




