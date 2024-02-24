const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { check, validationResult } = require('express-validator');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/MedPlug', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String }
});
const User = mongoose.model('User', userSchema);

passport.use(new FacebookStrategy({
  clientID: 'your_facebook_client_id', // replace with your Facebook App ID
  clientSecret: 'your_facebook_client_secret', // replace with your Facebook App Secret
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      // Create new user if not found
      user = new User({
        username: profile.displayName,
        email: profile.emails[0].value
      });
      await user.save();
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
}));

passport.use(new GoogleStrategy({
  clientID: 'your_google_client_id', // replace with your Google Client ID
  clientSecret: 'your_google_client_secret', // replace with your Google Client Secret
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      // Create new user if not found
      user = new User({
        username: profile.displayName,
        email: profile.emails[0].value
      });
      await user.save();
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
}));

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' })
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
