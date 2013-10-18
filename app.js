
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , utils = require('./utils')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , User = require('./models/users.js')
  , path = require('path')
  , config = {};

/**
 * Loading configuration
 */
switch(process.env.NODE_ENV) {
    case 'development':
        config = exports.config = require('./config-dev.json');
    break;
    case 'production':
        config = exports.config = require('./config-prod.json');
    break;
    default:
        if(typeof process.env.NODE_ENV == 'undefined') {
            config = exports.config = require('./config-dev.json');
            process.env.NODE_ENV = 'development';
        }
    break;
}

/**
* Database Connection
*/
var dbConex = exports.dbConex = utils.dbConnection(config.db.domain,config.db.name,config.db.user,config.db.pass);


var app = express();

// all environments
app.set('port', process.env.PORT || config.app.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(express.favicon(__dirname + '/public/favicon.ico', { maxAge: 2592000000 }));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
* Auth
*/
passport.use(new FacebookStrategy({
    clientID: config.auth.facebook.clientid,
    clientSecret: config.auth.facebook.clientsecret,
    callbackURL: config.auth.facebook.callback
  },
  function(accessToken, refreshToken, profile, done) {
    User.returningUser(profile.id,'FB', function(err, returningUser){
        if(returningUser!=null){
          // Returning User
          returningUser.nLogins++;
          returningUser.online = true;
          returningUser.save();
          console.log("Returning >> "+returningUser.username);
        }else{
          var gender = (profile.gender=='male'||profile.gender=='M')?'M':((profile.gender=='female'||profile.gender=='F')?'F':'U');
          // New User FB
          var gamer = new User({
            identity      : profile.id,      
            username      : profile.username,     
            name          : profile.displayName,      
            email         : profile.emails[0]['value'],      
            created       : Date.now(),         
            last_login    : Date.now(),          
            gender        : gender,
            location      : profile._json.location,     
            language      : profile._json.locale,/* Different */ 
            avatar        : 'http://graph.facebook.com/'+profile.id+'/picture',      
            socialNetwork : 'FB',
            online        : true,       
            nLogins       : 1
          });
          gamer.save(function(err){
              if(err){
                  console.log("Error guardando usuario >>", err);
              }else{
                  console.log("Usuario guardado")
              }
          });
        }
    });

    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  var fbUser = {};
  switch(user.provider){
	case 'facebook':
	  fbUser.identity = parseInt(user.id);
	  fbUser.playerId = parseInt(user.id)+'FB';
	  fbUser.name = user.displayName;
	  fbUser.avatar = 'http://graph.facebook.com/'+user.id+'/picture';
	  fbUser.socialNetwork = 'FB';
	  fbUser.online = true;
	  fbUser.gender = (user.gender=='male')?'M':((user.gender=='female')?'F':'U');
	break;
	default:
  }
  
  done(null, fbUser);

});

passport.deserializeUser(function(obj, done) {
      done(null, obj);
});

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

app.get('/', function(req, res){
    User.find({online:true}, function(err, userList){
      res.render('index', { title: 'Chat', user: req.user, users: userList });
    });
});
//app.get('/users', user.list);

app.get('/logout', function(req, res){
  console.log(req.user);
  if(typeof req.user != "undefined"){
      User.logout(req.user.identity);
  }
  req.logout();
  res.redirect('/');
});

var server = exports.server = http.createServer(app).listen(app.get('port'), config.app.domain, function(){
  console.log("Express server listening on port " + app.get('port'));
});

/**
* Socket.io
*/

require('./sockets.js');
