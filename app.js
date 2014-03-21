
/**
 * Module dependencies.
 */

var express = require('express')
, stylus = require('stylus')
  , nib = require('nib')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , redis =  require('redis');
  


var db = redis.createClient();
db.on("error",function(err){
	console.error("Error connecting to redis", err);
});


var app = express();

var cur_port;

console.log('Current env: '+app.get('env'));
switch (app.get('env')){
case 'production': 
	cur_port = 3000; 
	break;
case 'development': 
	app.use(express.errorHandler()); 
	app.use(express.logger('dev'));
	cur_port = 3000;
	break;
default: cur_port = 3000;
}

function addUser(req, res, next){
	
  var ua = req.headers['user-agent'];
  db.zadd('online', Date.now(), ua, next);
  
}

//fetch the users online in the last minute
function getCurUsers(req, res, next){
  var min = 60 * 1000;
  var ago = Date.now() - min;
  db.zrevrangebyscore('online', '+inf', ago, function(err, users){
    if (err) return next(err);
    req.curUsers = users;
    next();
  });
}
	 
function getTotalUsers(req, res, next){
  db.zrevrangebyscore('online', '+inf', 0, function(err, users){
    if (err) return next(err);
    req.totalUsers = users;
    next();
  });
}
	 

function compile(str, path) {
	  return stylus(str)
	    .set('filename', path)
	    .use(nib());
	}

// all environments
app.set('port', process.env.PORT || cur_port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
 
app.use(addUser);
app.use(getCurUsers);
app.use(getTotalUsers);


app.use(app.router);
app.use(stylus.middleware(
		  { src: __dirname + '/public'
		  , compile: compile
		  }
		));

		
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);
app.get('/users', user.list);

app.use(routes.notFound);
app.use(routes.errorPage);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
