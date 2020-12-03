var express = require('express');
var mysql = require('./dbcon.js');
var request = require('request');

var app = express();
var handlebars = require('express-handlebars').create({default:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 7181);

app.get('/',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM `workouts`', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
	var workoutArray = []; 
    for(var i in rows) 
    {
	     workoutArray.push({'id':rows[i].id, 'name': rows[i].name, 'reps':rows[i].reps, 'weight':rows[i].weight, 'date':rows[i].date, 'unit':rows[i].unit}) 
    }
   context.workouts = workoutArray;
   res.render('home',context); 
  });
});

app.get('/insert',function(req,res,next){
  var context = {};
  mysql.pool.query("INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `unit`) VALUES (?, ?, ?, ?, ?)", 
                  [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.unit], function(err, result){
    if(err){
      next(err);
      return;
    } 
    context.workouts = result.insertId; 
    res.send(JSON.stringify(context));  
  });
});

app.get('/update',function(req,res,next){
  var context = {};
	mysql.pool.query("SELECT * FROM `workouts` WHERE id=?", [req.query.id], function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
	var workoutArray = []; 
    for(var i in rows) 
    {
	     workoutArray.push({'id':rows[i].id, 'name': rows[i].name, 'reps':rows[i].reps, 'weight':rows[i].weight, 'date':rows[i].date, 'unit':rows[i].unit}) 
    }
	context.workouts = workoutArray[0];
    res.render('update',context); 
  });
});

app.get('/safe-update',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM `workouts` WHERE id=?', [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, unit=? WHERE id=? ",
        [req.query.name || curVals.name, req.query.reps || curVals.reps, req.query.weight || curVals.weight, req.query.date ||
		curVals.date, req.query.unit || curVals.unit, req.query.id], function(err, result){
				if(err){
				next(err);
				return;
				}
			mysql.pool.query('SELECT * FROM `workouts`', function(err, rows, fields){
				if(err){
					next(err);
					return;
				}
			var workoutArray = []; 
			for(var i in rows){
				workoutArray.push({'id':rows[i].id, 'name': rows[i].name, 'reps':rows[i].reps, 
				'weight':rows[i].weight, 'date':rows[i].date, 'unit':rows[i].unit}) 
			}
			context.workouts = workoutArray;
			res.render('home',context); 
			)};
		});
    }
  });
});

app.get('/delete', function(req, res, next){
	var context = {};
	mysql.pool.query("DELETE FROM `workouts` WHERE id=?", [req.query.id], 
	function(err, result){
		if(err){
			next(err);
			return;
		}
		res.render('home',context);
	});
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "unit BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});
