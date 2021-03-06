var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('./models/user');
const auth = require('./auth');

// Conenct to DB
mongoose.connect('mongodb://localhost:27017/loginapp', {useNewUrlParser: true});
var db = mongoose.connection;

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport init
auth(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res)=> res.render("dashbord", {user: req.user}));
app.get("/register", (req, res)=> res.render("register"));

// Register User
app.post('/register', function(req, res){
  var password = req.body.password;
  var password2 = req.body.password2;

  if (password == password2){
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      image:""
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      res.send(user).end()
    });
  } else{
    res.status(500).send("{errors: \"Passwords don't match\"}").end()
  }
});


var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  function(email, password, done) {
    User.getUserByUsername(email, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }
      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
     	if(isMatch){
     	  return done(null, user);
     	} else {
     	  return done(null, false, {message: 'Invalid password'});
     	}
     });
   });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// Endpoint to login
app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    console.log("New User Logged in :",req.user.username);
    res.redirect("/");
  }
);

// Endpoint to get current user
app.get('/user', function(req, res){
  res.send(req.user);
})

app.get("/login", (req, res)=> res.render("login"));


// Endpoint to logout
app.get('/logout', function(req, res){
  console.log("Success logout",req.user.username);
  req.logout();
  res.redirect("/");
  
});


// ===================== GOOGLE AUTH ============================

app.get('/auth/google', passport.authenticate('google', {
  scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));

app.get('/login/google/callback',
    passport.authenticate('google', {failureRedirect:'/'}),
    (req, res) => {
        console.log(req.user.profile.emails[0].value);
        
        req.session.token = req.user.token;
        res.redirect('/');
    }
);


app.listen(3000, () => console.log('App listening on port 3000!'))