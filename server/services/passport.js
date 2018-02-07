const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');
const User = mongoose.model('users');

const google = require('googleapis');
let  gmail = google.gmail('v1');
let OAuth2 = google.auth.OAuth2;



passport.serializeUser((user, done) => {
  done(null, user.id);
}); 
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const alreadyUser = await User.findOne({googleId: profile.id});
	// get email test
	

console.log(accessToken + "   TOKEN   " + refreshToken);	

	let authclient = new OAuth2(keys.googleClientID,keys.googleClientSecret,"/");
	authclient.setCredentials({access_token:accessToken,refresh_token:refreshToken});
	gmail.users.messages.list({userId:'me',auth:authclient},function err(err,response){
 	console.log("ERRROR " + "   " + err);	
	console.log("RESPONSE" + "   "  + response);
	
 	});


      console.log(profile);
      if(alreadyUser) {
	let authclient = new OAuth2(keys.googleClientID,keys.googleClientSecret,"/");
console.log(accessToken + "   TOKEN   " + refreshToken);	

	authclient.setCredentials({access_token:accessToken,refresh_token:refreshToken});
	gmail.users.messages.list({userId:'me',auth:authclient,maxResults:10},function err(err,response){
 	console.log("ERRROR " + "   " + err);	
	console.log(response);

	
 	});


        return done(null, alreadyUser);
      }

      const user = await new User({ 
        firstName: profile.name.givenName,
        lastName: profile.name.familyName, 
        email: profile.emails[0].value,
        googleId: profile.id 
      }).save();
	
      done(null, user);
    }
  )
);

