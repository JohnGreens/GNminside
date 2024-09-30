const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        // console.log(res.user)
        res.send(`
            <h1>Welcome</h1>
            <p>User ID: ${req.user.id}</p>
            <p>Signed in using: ${req.user.provider}</p>
            <p>Eaas Filter: ${req.user.eaasID}</p>
            <p>Klima Filter: ${req.user.klimaID}</p>
            <form action="/logout" method="post">
                <button type="submit">Sign Out</button>
            </form>
        `);
    } else {
        res.redirect('/login');
    }
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html'));
});

router.post('/logout', (req, res) => {
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
