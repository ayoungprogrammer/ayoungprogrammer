
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

var app = express();

app.use(function(req, res, next){
	  var ua = req.headers['user-agent'];
	  db.zadd('online', Date.now(), ua, next);
	});
	 
	// fetch the users online in the last minute
app.use(function(req, res, next){
  var min = 60 * 1000;
  var ago = Date.now() - min;
  db.zrevrangebyscore('online', '+inf', ago, function(err, users){
    if (err) return next(err);
    req.online = users;
    next();
  });
});
	 
app.get('/online', function(req, res){
  res.send(req.online.length + ' users online');
});

function compile(str, path) {
	  return stylus(str)
	    .set('filename', path)
	    .use(nib());
	}

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(stylus.middleware(
		  { src: __dirname + '/public'
		  , compile: compile
		  }
		));
		




		

	
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
