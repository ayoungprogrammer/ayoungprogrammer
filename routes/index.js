
/*
 * GET home page.
 */

exports.index = function(req, res){

  res.render('index', {serv:req});
};

exports.notFound = function(req, res){

  res.render('error404', {serv:req});
};

exports.errorPage = function(err, req, res, next){
	
	res.render('error501',{serv:req})
	
};