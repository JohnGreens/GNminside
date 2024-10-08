const express = require('express');
const axios = require('axios');
const router = express.Router();
const passport = require('passport');
const pca = require('../config/passport-setup');
const {GetAccessID} = require('../config/accessID')

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    const AuthID = req.user.id; // Assuming you're using the user's ID from LinkedIn as AuthID
    try {
        // Call the GetAccessID function to retrieve additional details
        const data = await GetAccessID(AuthID);
        const accessCode = data.accessCode;

        // Store the accessCode in session or cookie
        req.session.accessCode = accessCode; // or res.cookie('accessCode', accessCode, { httpOnly: true });

        // Redirect to the home page after successful login
        res.redirect('/');
    } catch (error) {
        console.error('Error fetching access IDs:', error);
        res.redirect('/register'); // Redirect to register if something goes wrong
    }
});



router.get('/linkedin', passport.authenticate('linkedin'));

router.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), async (req, res) => {
    const AuthID = req.user.id; // Assuming you're using the user's ID from LinkedIn as AuthID

    try {
        // Call the GetAccessID function to retrieve additional details
        const data = await GetAccessID(AuthID);
        const accessCode = data.accessCode;

        // Store the accessCode in session or cookie
        req.session.accessCode = accessCode; // or res.cookie('accessCode', accessCode, { httpOnly: true });

        // Redirect to the home page after successful login
        res.redirect('/');
    } catch (error) {
        console.error('Error fetching access IDs:', error);
        res.redirect('/register'); // Redirect to register if something goes wrong
    }
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

router.get('/azuread/callback', async (req, res, next) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ["user.read"],
        redirectUri: 'http://localhost:3000/auth/azuread/callback',
    };

    try {
        const response = await pca.acquireTokenByCode(tokenRequest);
        const user = {
            id: response.account.localAccountId,
            provider: 'Microsoft',
        }

        const apiResponse = await GetAccessID(user.id);
        if (apiResponse.accessCode && apiResponse.userData) {
            // Attach accessCode and userData to user object
            user.accessCode = apiResponse.accessCode;
            user.userData = apiResponse.userData;

            // Log the user in with Passport, storing the accessCode in the session
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/');  // Redirect to home/dashboard
            });
        } else {
            res.redirect('/register');
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).send('Authentication failed');
    }
});





module.exports = router;
