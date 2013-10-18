
/*
 * GET home page.
 */

exports.index = function(req, res){
/*    var mysql      = require('mysql');
    var connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : 'ariel159',
          database: 'zurmo'
    });

    connection.connect();

    connection.query('SELECT * from _user', function(err, rows, fields) {
      if (err) throw err;
*/
      res.render('index', { title: 'Chat', user: req.user/*, users: rows*/ });
  /*  });

    connection.end();*/
};
