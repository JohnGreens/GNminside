const express = require('express');
const axios = require('axios');
const router = express.Router();
const passport = require('passport');
const pca = require('../config/passport-setup');
const {GetAccessID} = require('../config/accessID')





router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    const AuthID = req.user.id; 
    try {
        const apiResponse = await GetAccessID(AuthID);
        if (apiResponse.accessCode && apiResponse.userData.accesscheck) {
            req.session.accessCode = apiResponse.accessCode; 
            req.session.userRights = apiResponse.userData.userInfo.userRights
            res.redirect('/');
        } else {
            res.redirect('/register');
        }
    } catch (error) {
        console.error('Error fetching access IDs:', error);
        res.redirect('/register'); // Redirect to register if something goes wrong
    }
});



router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), async (req, res) => {
    const AuthID = req.user.id; // Assuming you're using the user's ID from LinkedIn as AuthID

    try {
        const apiResponse = await GetAccessID(AuthID);
        if (apiResponse.accessCode && apiResponse.userData.accesscheck) {
            req.session.accessCode = apiResponse.accessCode; // or res.cookie('accessCode', accessCode, { httpOnly: true });
            req.session.userRights = apiResponse.userData.userInfo.userRights
            res.redirect('/');
        } else {
            res.redirect('/register');
        }
    } catch (error) {
        console.error('Error fetching access IDs:', error);
        res.redirect('/register'); // Redirect to register if something goes wrong
    }
});




router.get('/azuread', (req, res) => {
    const authCodeUrlParameters = {
        scopes: ["user.read"],
        redirectUri: process.env.Azure_CALLBACK_URL,
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
        redirectUri: process.env.Azure_CALLBACK_URL,
    };

    try {
        const response = await pca.acquireTokenByCode(tokenRequest);
        const user = {
            id: response.account.localAccountId,
            provider: 'Microsoft',
            providerUsername: response.account.name,
            providerEmail:response.account.username
        }
        const apiResponse = await GetAccessID(user.id);
        if (apiResponse.accessCode && apiResponse.userData.accesscheck==true) {
            // Attach accessCode and userData to user object
            // user.accessCode = apiResponse.accessCode;
            // user.userData = apiResponse.userData;
            // user.userRights=user.userData.userInfo.userRights
            user.accessCode = apiResponse.accessCode;
            // user.userData = apiResponse.userData.userInfo;
            user.userRights=apiResponse.userData.userInfo.userRights;
            // user.userData.accesscheck = apiResponse.userData.accesscheck;
            // user.userRights=user.userData.userRights;


            // Log the user in with Passport, storing the accessCode in the session
            req.login(user, function(err) {
                if (err) { 
                    console.error('Login error:', err);
                    return next(err); 
                }
                return res.redirect('/');  // Redirect to home/dashboard
            });
        } else {
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/register');  // Redirect to register
            });
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).send('Authentication failed');
    }
});

// Endpoint to provide auth info
router.get('/api/auth-info', (req, res) => {
    if (req.isAuthenticated()) {
        const authID = req.user.id; // Assuming the authID is stored in req.user.id
        const authProvider = req.user.provider; // Assuming the authProvider is stored in req.user.provider
        const authProviderUsername = req.user.providerUsername; // Assuming the authProvider is stored in req.user.provider
        const authProviderEmail = req.user.providerEmail; // Assuming the authProvider is stored in req.user.provider
        res.json({ authID, authProvider, authProviderUsername, authProviderEmail});
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Register route
router.post('/api/register', async (req, res) => {
    const { fornavn, etternavn, organisasjon, rolle, telefon, authID, authProvider, email,authProviderUsername,authProviderEmail } = req.body;

    try { 
        const response = await axios.post(process.env.AZUREGNAPI_ENDPOINT, {
            TypeOfRequest: "testregistation",
            AuthID: authID,
            AuthProvide:authProvider,
            FirstName:fornavn,
            LastName:etternavn,
            Email:email,
            Organisation:organisasjon,
            PhoneNumber:telefon,
            Role:rolle,
            AuthEmail:authProviderEmail,
            AuthName:authProviderUsername
        });
        const data = response.data;

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





module.exports = router;
