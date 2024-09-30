const express = require('express');
const router = express.Router();
const passport = require('passport');
const msalConfig = require('../config/msalConfig');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const pca = new ConfidentialClientApplication(msalConfig);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

// This route initiates the Azure AD login process
router.get('/azuread', (req, res) => {
    const redirectUri = 'http://localhost:3000/auth/azuread/callback';  // Make sure this matches your Azure AD app registration

    const authCodeUrlParameters = {
        scopes: ["user.read"],
        redirectUri: redirectUri,
    };

    // Use the PCA instance to get the auth URL
    pca.getAuthCodeUrl(authCodeUrlParameters)
        .then((authUrl) => {
            // Redirect user to the Azure AD login page
            res.redirect(authUrl);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Failed to initiate authentication.");
        });
});


router.get('/azuread/callback', (req, res, next) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ["user.read"],
        redirectUri: 'http://localhost:3000/auth/azuread/callback',
    };

    // Example of saving user after successful authentication with MSAL
    pca.acquireTokenByCode(tokenRequest).then((response) => {
        // Create a user object
        const user = {
            id: response.account.tenantId,
            provider: 'Microsoft'
        };

        // Log in the user by saving it to the session
        req.login(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/'); // Redirect to a secure page or dashboard
        });
    }).catch((error) => {
        console.error(error);
        res.status(500).send('Authentication failed');
    });
});



module.exports = router;
