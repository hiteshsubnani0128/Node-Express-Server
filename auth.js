const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
            clientID: "595687720389-c14i3d729fcrp6akn6cduofg00d18fv2.apps.googleusercontent.com",
            clientSecret: "xMxQ9-t_wDGW49ILca59lCP6",
            callbackURL: "http://localhost:3000/login/google/callback"
        },
        (token, refreshToken, profile, done) => {
            return done(null, {
                profile: profile,
                token: token
            });
        }));
};