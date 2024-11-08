const express = require('express');
const router = express.Router();
const path = require('path');

const {fetchPowerBIEmbedInfo,reportsList} = require('../config/powerbiEmbed-setup');


router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        const userRights =  req.user.userRights || req.session.userRights ||  null;
        const accessCode = req.user.accessCode || req.session.accessCode || null;


        if (accessCode && userRights !== null) {
            // Add reportsList to the rendered dashboard
            res.render('dashboard', { 
                title: 'GreenSide', 
                accessCode: JSON.stringify(accessCode),
                userRights: userRights,
                reports: reportsList  // Pass reportsList to the template
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

router.get('/test', (req, res) => {
            res.render('dashboard', { title: 'GreenSide' });
});


// Endpoint to serve the REPORT_1_ID to the client
router.get('/config', (req, res) => {
    res.json({ report1Id: process.env.REPORT_1_ID });
});
// API endpoint to get the list of reports for menu
router.get('/reports', (req, res) => {
    res.json(reportsList);
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
