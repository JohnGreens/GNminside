
// const {getProjectAccessDetails} = require('../../controllers/accessIDhandlers');
// const {embedReport,updateReportFilters} = require('../../controllers/powerbiEmbed');
// const {toggleSidebar,applyProjectFilter,saveLastReportId} = require('../../controllers/main');
import {embedReport,updateReportFilters} from '../../src/powerbiEmbed.js'
import {toggleSidebar,applyProjectFilter} from '../../src/main.js'


// Make functions available globally from powerbiEmbed.js
window.embedReport = embedReport;
window.updateReportFilters = updateReportFilters;



// Make functions available globally from main.js
window.toggleSidebar = toggleSidebar;
window.applyProjectFilter = applyProjectFilter;
window.saveLastReportId = saveLastReportId;


