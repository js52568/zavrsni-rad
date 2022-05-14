require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const cors = require("cors");


const User = require("./schemas/UserSchema.js");

const registerRoute = require('./routes/register.routes');
const loginRoute = require('./routes/login.routes');
const mainpageRoute = require('./routes/mainpage.routes');
const authGoogleRoute = require('./routes/authgoogle.routes');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());     //ili express?
app.use(cors({origin: "http://localhost:3000", credentials: true}));  //sto to tocno radi
app.use(express.static("front/public"));        //upitno

const PORT = process.env.PORT || 8080;

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
mongoose.connect("mongodb://localhost:27017/testSportsDB", {useNewUrlParser: true});

/* const users = [
    {name: "Jura", username:"jura"},
    {name:"Darko", username: "darko"}
]

const users2 = [
    {name: "Jura", username:"jura"},
    {name:"Drugi", username: "darko"}
] */

/* app.get("/users", function(req,res) {
    res.json(users);
  });

app.get("/drugi", function(req,res) {
    res.json(users2);
});

app.post("/users", function(req,res) {
    console.log(req.body.name);
}); */

passport.use(User.createStrategy());

passport.serializeUser(function(user,done) {
  done(null, user.id);
});

passport.deserializeUser(function(id,done) {
  User.findById(id, function(err,user) {
      done(err,user.id);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/google/main",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

//ove sve metode moram promijeniti da odgovaraju react-u i mogu ih poslagati u svoje .routes fileove

app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/main', mainpageRoute);
//app.use('/auth/google', authGoogleRoute);

app.get("/", function(req,res) {
    res.send("Hello World");
  });
  
app.get("/logout", function(req, res){
  req.logout();
  //res.redirect("/");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get('/auth/google/main',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000');
  }); 


app.listen(PORT, console.log(`Server started on port ${PORT}`));