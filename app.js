var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    bodyParser = require('body-parser'),
    request = require('request'),
    assert = require('assert');

const mc_api = "http://localhost:3100/";

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/resources'));

var urlencodedParser = bodyParser.urlencoded({ extended: false });
    //Handler for internal server errors
    function errorHandler(err, req, res){
      console.error(err.message);
      console.error(err.stack);
      if (res.status == 500){
        res.render('errtemplate', {error: err});
      }else if(res.status == 404) {
        res.render('404', {error: err});
      }
    }

    var monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    var d = new Date();
    var y = d.getFullYear();
    var dd = d.getDay();
    var hh = d.getHours();
    var mm = d.getMinutes();
    var ss = d.getSeconds();
    var m = monthNames[d.getMonth()];

    var arr = {
      'username': 'Julius Momnang',
      'year': y,
      'month': m,
      'tasks_label': 'My Tasks',
      'courses_label':'My Courses',
      'performance_label': 'My Performance',
      'attendance_label': 'Attendance',
      'submissions_label': 'My Submissions',
      'manage_usr_label': 'Manage User',
      'reports_label':'Reports'
    };

    //log the attendance register for student
    var logAttendance = function(req, res, data){
      var auth_url = mc_api + "attendance/";
      var r = request.post(auth_url, {form:data});
      console.log(r);

      //email, fullname, year, month, day, time, att_id, gradepoint
    }

    //load login page
    app.get('/', function(req, res){
      res.render("login", arr);
    });

    //handle authentication of users.
    app.post('/', urlencodedParser, function(req,res){

      var auth_url = mc_api + "login/"+ req.body.email + "/" + req.body.pwd;
      request(auth_url, function (error, response, body) {
        var info = JSON.parse(body);
        if (info.length != 1){
          res.render("login", {statusCode: response && response.statusCode, loggedIn: false});
        }
        if(info.length == 1){

          //prepare display data
          var arr = {
            'username': info[0].firstname + " " + info[0].lastname,
            'email': info[0].email,
            'status': info[0].status,
            'year': y,
            'month': m,
            'day': dd,
            'loggedIn': true,
            'body': info[0],
            'tasks_label': 'My Tasks',
            'courses_label':'My Courses',
            'performance_label': 'My Performance',
            'attendance_label': 'Attendance',
            'submissions_label': 'My Submissions',
            'manage_usr_label': 'Manage User',
            'reports_label':'Reports'
          };

          //prepare attendance data
          var _time = hh + ' ' + mm + ' ' + ss;
          var att_data = {email: arr.email, fullname: arr.firstname + ' ' + arr.lastname,
                          year: arr.year, month: arr.month, day: arr.day, time: _time,
                          att_id: 'ATT0000001', gradepoint: 5};

          logAttendance(req, res, att_data);
          res.render("tasks", arr);
        }
        //console.log('error:', error); // Print the error if one occurred
        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.
      });
    });

    app.get('/home', function(req, res){
      res.render("index", arr);
    });

    app.get('/invoices', function(req, res){
      res.render("invoice", arr);
    });

    app.get('/tasks', function(req, res){
      res.render("tasks", arr);
    });

    app.get('/attendance', function(req, res){
      res.render("attendance", arr);
    });

    app.get('/datatables', function(req, res){
      res.render("data-table", arr);
    });

    app.get('/courses', function(req, res){
      res.render("modals", arr);
    });

    app.get('/reports', function(req, res){
      res.render("invoice", arr);
    });

    app.get('/404', function(req, res){
      res.render("404", {'fruits': ['apple','orange','banana','peach','passion']});
    });
    //app.get('/:name', function(req, res){
    //    var name = req.params.name;
    //    var getvar1 = req.query.getvar1;
    //    var getvar2 = req.query.getvar2;
    //    res.render("hello", {name: name, getvar1: getvar1, getvar2:getvar2});
    //});

    app.post('/favfruit', function(req, res){
      var fav = req.body.fruit;
      if (typeof fav == 'undefined'){
        next(Error('Please choose a fruit'));
      }else{
        res.send('Your favourite fruit is ' + fav);
      }
    });



  app.use(errorHandler);

    var server = app.listen(3200, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });
