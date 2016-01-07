var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;

//var $ = require('jquery');
//var bootstrap = require('bootstrap');

var routes = require('./routes/index');
var users = require('./routes/users');
var success = require('./routes/success');
var signup = require('./routes/signup')

var app = express();

var mongoid = 'admin';
var mongopw = 'opd1234'


console.log("Server Start");



// mongodb Connect
var db = mongoose.connect('mongodb://'+mongoid+':'+mongopw+'@ds039155.mongolab.com:39155/opd_users', function(err){
    if(err) {
        console.err(err);
        throw err;
    }
});
console.log("MongoDB : Connected");


var Schema = mongoose.Schema;
var UserSchema = new Schema({
    id : String,
    pw : String,
    name : String,
    projects : [{
        title : String,
        val : String
    }]
})

var User = mongoose.model('users', UserSchema);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', routes);
app.use('/signup', signup);
//app.use('/users', users);
app.use('/success', success);



var checkedID;
var checkedPW;
var checkedName;
var projectCount;
var projects;

app.get('/users', function(req, res){
    User.find({}, function(err, docs){
       res.json(docs);
        console.log(docs);
    });
});

// project 부분

app.get('/project', function(req, res){
    res.render('project', {user_name : checkedName});
});


app.post('/project', function(req, res){
    var project_name = req.body.input_project_name;
    
    console.log('Project Name : ' + project_name);
    
    User.findOne({id : checkedID}, function(err, doc){
        console.log("Find id")
        if(err){ 
            throw err;
        }
        doc.projects.push({title : project_name, val : ''});
        doc.save();
        console.log(doc);
        console.log("Create Project Success!");
    });
});


// join part
app.post('/signup', function(req, res){
    var name = req.body.name;
    var id = req.body.id;
    var pw = req.body.pw;
    
    var user = new User({id : id, pw : pw, name : name});
    user.save(function(err){
        if(err){
            console.err(err);
            throw err;
        }
        console.log("name : " + name);
        console.log("id : " + id);
        console.log("pw : " + pw);
        console.log("으로 저장되었습니다.");
        res.redirect('/');
    });
});




//login part
app.post('/', function(request, response, next){
    var id = request.body.id;
    var pw = request.body.pw;
    
    console.log("Login request");
    console.log("ID : " +  id);
    console.log("PW : " + pw);
    console.log("위 정보로 부터 로그인 요청이 들어왔습니다.\n\n")
    
    User.findOne({id : id}, function(err, doc){
        console.log("Find id")
        if(err){ 
            throw err;
        }
        
        if(doc == null){
            console.log("해당 ID를 찾지 못했습니다.");
            response.render('login', {islogin : 'fail'});
        }
        else{
            console.log(doc);
            checkedID = doc.get('id', String);
            checkedPW = doc.get('pw', String);
            checkedName = doc.get('name', String);
            console.log(checkedID + " " + checkedPW + " " + checkedName + " 정보를 찾았습니다.");


           if(id === checkedID && pw === checkedPW){
                console.log("Login Success!\n\n");
                response.redirect('/project');
//                response.render('project', {user_name : checkedName});
            }
            else{
                console.log("Login Failed\n\n");
                response.render('login', {islogin : 'fail'});
            }
        }
    });
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
