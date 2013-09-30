
/*
 * GET home page.
 */

exports.index = function(req, res){

  res.render('index', {serv:req});
  res.send(req.online.length + ' users online');
};