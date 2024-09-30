const express = require('express');
const axios = require('axios');
const router = express.Router();
const passport = require('passport');
const pca = require('../config/passport-setup');



router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});


// Azure AD login route
router.get('/azuread', (req, res) => {
    const redirectUri = 'http://localhost:3000/auth/azuread/callback';

    const authCodeUrlParameters = {
        scopes: ["user.read"],
        redirectUri: redirectUri,
    };

    pca.getAuthCodeUrl(authCodeUrlParameters)
        .then(authUrl => {
            res.redirect(authUrl);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Failed to initiate authentication.");
        });
});

// Azure AD callback route
// router.get('/azuread/callback', (req, res, next) => {
//     const tokenRequest = {
//         code: req.query.code,
//         scopes: ["user.read"],
//         redirectUri: 'http://localhost:3000/auth/azuread/callback',
//     };

//     pca.acquireTokenByCode(tokenRequest)
//         .then(response => {
//             const user = {
//                 id: response.account.tenantId,
//                 provider: 'Microsoft'
//             };

//             req.login(user, err => {
//                 if (err) { return next(err); }
//                 res.redirect('/'); // Redirect to the home page or dashboard
//             });
//         })
//         .catch(error => {
//             console.error(error);
//             res.status(500).send('Authentication failed');
//         });
// });
router.get('/azuread/callback', (req, res, next) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ["user.read"],
        redirectUri: 'http://localhost:3000/auth/azuread/callback',
    };

    pca.acquireTokenByCode(tokenRequest).then(response => {
        const user = {
            id: response.account.localAccountId,
            provider: 'Microsoft',
        };
       
        axios.post('https://prod-08.northcentralus.logic.azure.com:443/workflows/a866db458a254ce38fb746a844b1fb91/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=vOVP3IY0qM4C0o5lHIC_7_pkoE7X78gF5EJ5uLwaW98', {
            TennentID: user.id,
            TypeOfRequest: "GetMinsideIDs"  
        })
        .then(apiResponse => {
            // console.log(apiResponse)
            if (apiResponse.data && apiResponse.data.eaas) {
                console.log(apiResponse.data.eaas[1])
                // If user is found, log them in and proceed
                user.eaasID=apiResponse.data.eaas
                user.klimaID=apiResponse.data.klima
                req.login(user, function(err) {
                    if (err) { return next(err); }
                    return res.redirect('/');  // Redirect to home or dashboard
                });
            } else {
                // If no user is found, redirect to registration page
                res.redirect('/register');
            }
        })
        .catch(error => {
            console.error("Error posting to API:", error);
            res.status(500).send('Authorization failed');
        });
    }).catch(error => {
        console.error(error);
        res.status(500).send('Authentication failed');
    });
});



module.exports = router;
