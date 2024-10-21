const express = require('express');
const axios = require('axios');
const router = express.Router();
const passport = require('passport');
const pca = require('../config/passport-setup');
const {GetAccessID} = require('../config/accessID')
// require('dotenv').config();





router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
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



// Azure AD login route
router.get('/azuread', (req, res) => {
    // const redirectUri = 'http://localhost:3000/auth/azuread/callback';
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
        console.log("before GetAccessID")
        const apiResponse = await GetAccessID(user.id);
        if (apiResponse.accessCode && apiResponse.userData.accesscheck==true) {
            console.log("inside GetAccessID")
            // Attach accessCode and userData to user object
            user.accessCode = apiResponse.accessCode;
            user.userData = apiResponse.userData;
            // console.log("userData routhe /auth",user.userData.userInfo)
            user.userRights=user.userData.userInfo.userRights
            // Log the user in with Passport, storing the accessCode in the session
            console.log(user)
            req.login(user, function(err) {
                if (err) { return next(err); }
                console.log("redirect user to /")
                return res.redirect('/');  // Redirect to home/dashboard
            });
        } else {
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/register');  // Redirect to register
            });
            // res.redirect('/register');
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).send('Authentication failed');
    }
});

// Endpoint to provide auth info
router.get('/api/auth-info', (req, res) => {
    if (req.isAuthenticated()) {
        console.log("isAuthenticated",req.user)
        const authID = req.user.id; // Assuming the authID is stored in req.user.id
        const authProvider = req.user.provider; // Assuming the authProvider is stored in req.user.provider
        const authProviderUsername = req.user.providerUsername; // Assuming the authProvider is stored in req.user.provider
        const authProviderEmail = req.user.providerEmail; // Assuming the authProvider is stored in req.user.provider
        res.json({ authID, authProvider, authProviderUsername, authProviderEmail});
    } else {
        res.status(401).json({ message: 'Not authenticated' });
        console.log(req)
    }
});

// Register route
router.post('/api/register', async (req, res) => {
    const { fornavn, etternavn, organisasjon, rolle, telefon, authID, authProvider, email,authProviderUsername,authProviderEmail } = req.body;

    try { 
        const response = await axios.post('https://prod-24.northcentralus.logic.azure.com:443/workflows/5c0ed215db06475ca39bc55eee7ac6b8/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_Kvsr4SGY2FWeW4Oh_9HM_t77Dxkr4US2gzpE0G03A4', {
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
        console.log(data)
        

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
}




});





module.exports = router;
