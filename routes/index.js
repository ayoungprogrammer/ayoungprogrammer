
/*
 * GET home page.
 */

exports.index = function(req, res){

  res.render('index', {serv:req});
};

exports.notFound = function(req, res){

  res.render('404', {serv:req});
};