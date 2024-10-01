const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

const { ConfidentialClientApplication } = require('@azure/msal-node');
const msalConfig = require('./msalConfig');

const pca = new ConfidentialClientApplication(msalConfig);
const CustomStrategy = require('passport-custom').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    let user = {
      id: profile.id,
      provider: 'Google'
    };
    return done(null, user);
  }
));

passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "/auth/linkedin/callback",
    scope: ['profile','openid']
  },
  (accessToken, refreshToken, profile, done) => {
    let user = {
      id: profile.id,
      provider: 'LinkedIn'
    };
    return done(null, user);
  }
));


passport.use('azuread', new CustomStrategy((req, done) => {
    const redirectUri = 'http://localhost:3000/auth/azuread/callback';
    const authCodeUrlParameters = {
        scopes: ["user.read"],
        redirectUri: redirectUri,
    }
    pca.getAuthCodeUrl(authCodeUrlParameters)
        .then(authUrl => {
            done(null, { url: authUrl });
        })
        .catch(error => {
            done(error);
        });
}));



passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// module.exports = passport;
module.exports = pca;