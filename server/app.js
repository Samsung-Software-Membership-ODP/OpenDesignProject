var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var mkdir = require('mkdirp');
var fs = require('fs');
var beautify = require('js-beautify').js_beautify;

var beautify_js = require('js-beautify');
var beautify_css = require('js-beautify').css;
var beautify_html = require('js-beautify').html;

// firebase
var Firebase = require("firebase");

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

//fs.readFile('foo.js', 'utf8', function (err, data) {
//    if (err) {
//        throw err;
//    }
//    var temp = data.toString().split("<script>");
//
//    console.log(beautify_html(temp[0], { indent_size: 2 }));
//    console.log(beautify(temp[1], { indent_size: 2 }));
//    console.log(beautify_html(temp[2], { indent_size: 2 }));
////    for(var i = 0; i < temp.length; i++){
////        console.log(temp[i]+'\n\n\n\n\n\n');
////    }
////    console.log(temp[0]+'\n\n\n\n\n\n'+temp[1]);
//    
//});



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










// server start

var checkedID;
var checkedPW;
var checkedName;
var projectCount;
var projects;
var titles = new Array();




app.get('/users', function(req, res){
    User.find({}, function(err, docs){
       res.json(docs);
        console.log(docs);
    });
});







// testing space

app.get('/test2', function(req, res){
    res.render('test2');
});

app.post('/test2', function(req,res){
    console.log('post!') ;
//    console.log(req.body.data);
    console.log(beautify_html(req.body.data, { indent_size: 2 }));
    
    console.log('폴더를 생성합니다.');
    mkdir('./public/workspaces', function(err){
        console.log(err);
    });
    
    var file = './public/workspaces/index.html';
    
    fs.open(file, 'w', function(err, fd){
        if(err) throw err;
        console.log('file open complete');
        
        fs.writeFile(file, beautify_html(req.body.data, { indent_size: 2 }), 'utf-8', function(err){
           if(err) throw err;
            console.log("file write complete");
        });
    });
});


// project part
app.get('/project', function(req, res){
    res.render('project', {user_name : checkedName, projects : projects, titles : titles});
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
        
        projects = doc.get('projects');
         for(var i = 0; i < projects.length; i++){
                titles[i] = projects[i]['title'];
            }
        console.log(titles);
        
        console.log(doc);
        console.log("Create Project Success!");
        res.redirect('/project');
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
    console.log("위 정보로 부터 로그인 요청이 들어왔습니다.\n\n");
    
    
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
            projects = doc.get('projects');
            
            console.log(checkedID + " " + checkedPW + " " + checkedName + " 정보를 찾았습니다.");
            console.log(projects);
            console.log(projects.length + "개의 프로젝트를 찾았습니다.")
            
            
            for(var i = 0; i < projects.length; i++){
                titles[i] = projects[i]['title'];
            }
            console.log(titles);
            
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


var project_title;

// workspace part
app.get('/workspace', function(req, res){
    
    var project_val;    
    project_title = req.param('data');
    
    
    console.log('get!!');
//    console.log();
    
    User.findOne({id : checkedID}, function(err, doc){
        
        console.log("Find id")
        
        if(err){ 
            throw err;
        }
        
        projects = doc.get('projects');
        
        for(var i = 0; i < projects.length; i++){
            titles[i] = projects[i]['title'];
            
            if(projects[i]['title'] == req.param('data')){
                project_val = projects[i]['val'];
                
                var bodyCode = project_val;
                var start = bodyCode.indexOf('\<body\>');
                var end = bodyCode.indexOf('\</body\>');
                bodyCode = bodyCode.slice(start+8, end);
                
                console.log(bodyCode);
                                             
                res.render('workspace', {val : bodyCode});

                break;
            }
        }
        
    });
    
//    console.log('test2!!!!\n\n\n\n\n');
//    console.log(project_val);
//    
//    res.render('workspace', {val : project_val});
    
    
    
    
//    
//    console.log('폴더를 생성합니다.');
//    mkdir('./public/workspaces', function(err){
//        console.log(err);
//    });
//    
//    var file = './public/workspaces/index.html';
//    
//    fs.open(file, 'w', function(err, fd){
//        if(err) throw err;
//        console.log('file open complete');
//        
//        fs.writeFile(file, '<h1>Test!</h1>\n'+text, 'utf-8', function(err){
//           if(err) throw err;
//            console.log("file write complete");
//        });
//    });
});

app.post('/workspace', function(req, res){
//    console.log(beautify_html(req.body.data, { indent_size: 2 }));
    
//    var project_title = req.param('data');
    var project_val = beautify_html(req.body.data, { indent_size: 2 });
    
    console.log('폴더를 생성합니다.');
    mkdir('./public/workspaces', function(err){
        console.log(err);
    });
    
    var file = './public/workspaces/index.html';
    
    fs.open(file, 'w', function(err, fd){
        if(err) throw err;
        console.log('file open complete');
        
        fs.writeFile(file, beautify_html(req.body.data, { indent_size: 2 }), 'utf-8', function(err){
           if(err) throw err;
            console.log("file write complete");
        });
    });
    
    
    
    User.findOne({id : checkedID}, function(err, doc){
        
        console.log("Find id")
        
        if(err){ 
            throw err;
        }
        
//        doc.projects.push({title : project_title, val : project_val});
//        doc.save();
        
        projects = doc.get('projects');
        
        for(var i = 0; i < projects.length; i++){
            
            
            if(projects[i]['title'] == project_title){
                console.log(projects[i]['title']);
                projects[i]['val'] = project_val;
                console.log(projects[i]['val']);
                doc.save();
                break;
            }
        }
        
    });
    
    
    
});


app.get('/test', function(req, res){
    res.render('test', {user_id : checkedID});
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
