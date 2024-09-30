const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
// const passport = require('./config/passport-setup');
const passport = require('passport')
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
// const path = require('path')
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
