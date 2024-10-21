const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const passport = require('passport')
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const handlebars = require('handlebars'); // Explicitly require handlebars
// require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;


app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', helpers: {
    safe: function (object) {
        return new handlebars.SafeString(JSON.stringify(object));
    }

}}));
app.set('view engine', 'hbs');

app.set('views', './views');  // Ensure views directory is set correctly
app.set('trust proxy', 1);  // 1 means trust the first proxy (which is the Azure proxy)
// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: process.env.SESSION_RESAVE,
    saveUninitialized: process.env.SESSION_SAVEUNITIALIZED,
    cookie: { secure: process.env.SESSION_COOKIE_SECURE}// maxAge: 24 * 60 * 60 * 1000 
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
