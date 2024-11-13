const express = require('express');
const router = express.Router();
const path = require('path');

const {fetchPowerBIEmbedInfo,fetchReportsMenu} = require('../config/powerbiEmbed-setup');
//,reportsList

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        const userRights =  req.user.userRights || req.session.userRights ||  null;
        const accessCode = req.user.accessCode || req.session.accessCode || null;


        if (accessCode && userRights !== null) {
            // Add reportsList to the rendered dashboard
            res.render('dashboard', { 
                title: 'GreenSide', 
                accessCode: JSON.stringify(accessCode)
                // ,
                // userRights: userRights
                // ,
                // reports: reportsList  // Pass reportsList to the template
            });
        } else {
            console.log('No access code, redirecting to login');
            res.redirect('/login');
        }
    } else {
        console.log('User not authenticated, redirecting to login');
        res.redirect('/login');
    }
});




// // Endpoint to serve the REPORT_1_ID to the client
// router.get('/config', (req, res) => {
//     res.json({ report1Id: process.env.DEFAULTREPPORTID });
// });


// API endpoint to get the list of reports for menu
router.get('/reports', async (req, res) => {
    if (req.session.reportsList2) {
        // Return the reports list from the session if it exists
        res.json(req.session.reportsList2);
    } else {
        // Fetch the reports list and store it in the session
        try {
            const reportsList2 = await fetchReportsMenu(req.user.id);
            req.session.reportsList2 = reportsList2;
            res.json(reportsList2);
        } catch (error) {
            console.error('Error fetching reports list:', error);
            res.status(500).send('Error fetching reports list');
        }
    }
});



router.get('/dashboardsetting', (req, res) => {
    if (req.isAuthenticated()) {
        let dashboardsetting = false
        if (req.user.userRights == process.env.FILTERANDNAVUSERROLE1 || req.user.userRights == process.env.FILTERANDNAVUSERROLE2){
            dashboardsetting = true
        }
        return res.json({ dashboardsetting });
    }
});



// API endpoint to retrieve embedding information for a specific report
router.get('/embed-info/:reportId', async (req, res) => {
    try {
        const reportId = req.params.reportId;
        const embedInfo = await fetchPowerBIEmbedInfo(reportId);
        res.json(embedInfo);
    } catch (error) {
        console.error('Error retrieving embed info:', error);
        res.status(500).send('Error retrieving embed info');
    }
});


//register route Not done yet
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html'));
});

//login route
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

//logout route
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) {
                console.log('Error : Failed to destroy the session during logout.', err);
            }
            res.redirect('/login');
        });
    });
});


module.exports = router;
