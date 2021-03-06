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

var ComponentSchema = new Schema({
	title : String,
	head : String,
	body : String
});

var TempletSchema = new Schema({
	title : String,
	val : String,
	html : String,
	css : String
});


var User = mongoose.model('users', UserSchema);
var ComponentDB = mongoose.model('Components',ComponentSchema);
var TempletDB = mongoose.model('Templet', TempletSchema);

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
var loginedDoc;
var titles = new Array();



app.get('/addCompo',function(req,res){
	res.render('addCompo');
});

app.post('/addCompo',function(req,res){
	var title = req.body.title;
	var head = req.body.head;
	var body = req.body.body;

	var start,end;
	var ims,headEnd;
	var concatFront,concatEnd;
	var flag=0;

	if(head === null || body === null || title === null){
		console.log("Not Found Info\n");
		flag=1;
	}
	if(flag==0){
	ComponentDB.find({}, function(err, docs){
		flag=0;
		for(var i=0 ; i<docs.length ; i++)
		{
			if(docs[i].title == title)
			{
				console.log("overlap name");
				flag=1; break;
			}
		}
		// 중복 확인


		// 공백 체크
		var blank_pattern = /[\s]/g;
		if( blank_pattern.test(title) == true){
			flag=1;
			console.log("blank");
		}
		// 공백 체크
		var special_pattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
		if( special_pattern.test(title) == true ){
			flag=1;
			console.log("special_pattern");
		}
		// 특수문자 체크
		var number_pattern = /^[A-Za-z]{1}/;
		if(number_pattern.test(title) == false){
			flag=1;
			console.log("First String Number!");
		}
		// 첫글자 숫자 체크
		console.log("flag "+flag);
		if(flag == 0){

			ims=head;
			headEnd=ims.indexOf("\{");

			concatFront=".";
			concatEnd=ims.slice(headEnd,ims.length);
			head=concatFront+title+concatEnd;

			// console.log(head);
			//change Head

			ims=body;
			start=ims.indexOf("class=\"");
			concatFront=ims.slice(0,start+7);
			end=ims.indexOf("\"",start+7);
			concatEnd=ims.slice(end,ims.length);

			body=concatFront+"compo "+title+concatEnd;

			ims=body;
			start=ims.indexOf("id=\"");
			concatFront=ims.slice(0,start+4);
			end=ims.indexOf("\"",start+4);
			concatEnd=ims.slice(end,ims.length);

			body=concatFront+title+concatEnd;

			console.log(body);
			ComponentDB.create({title: title, head: head , body: body },function(err,data){
			});

			console.log("Compo Create Complete");
		}
		else{
			console.log("Compo Create Fail");
		}
		res.render('addCompo');
	});
	}
});





app.get('/users', function(req, res){
	User.find({}, function(err, docs){
	 res.json(docs);
	 console.log(docs);
 });
});


// testing space

app.get('/test2', function(req, res){
	res.render('mid2');
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
			
			titles = [];
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



// project part
app.get('/project', function(req, res){

	User.findOne({id : checkedID}, function(err, doc){
			console.log("Find id");

			if(err){
				throw err;
			}
			titles = [];
			projects = doc.get('projects');
			for(var i = 0; i < projects.length; i++){
				titles[i] = projects[i]['title'];
			}
			res.render('project', {user_name : checkedName, projects : projects, titles : titles});
	});
	
});

app.post('/project', function(req, res){
	var type = req.body.type;
	var index = req.body.index;
	var project_name = req.body.input_project_name;
//    console.log(title2+ " " + checkedID + " " + type);
	if(type == "remove"){
		console.log("in remove " + index);

		User.findOne({id : checkedID},function(err,doc){
			if(err){
				throw err;
			}

			doc.projects[index].remove();
			doc.save();

			titles = [];
			projects = doc.get('projects');
			for(var i = 0; i < projects.length; i++){
				titles[i] = projects[i]['title'];
			}

			res.redirect('/project');
		});

	}
	else{
		console.log('Project Name : ' + project_name);
		User.findOne({id : checkedID}, function(err, doc){
			console.log("Find id");

			if(err){
				throw err;
			}

			doc.projects.push({title : project_name, val : ''});
			doc.save();

			projects = doc.get('projects');
			for(var i = 0; i < projects.length; i++){
				titles[i] = projects[i]['title'];
			}


			mkdir('./public/workspaces/'+project_name, function(err){
				console.log(err);
			});

			console.log('make dir!');
			var file = './public/workspaces/'+project_name+'/index.html';

			fs.open(file, 'w', function(err, fd){
				if(err) throw err;
				console.log('file open complete');

				fs.writeFile(file, "", 'utf-8', function(err){
				 if(err) throw err;
				 console.log("file write complete");
			 });
			});    
			// console.log(titles);
			//
			// console.log(doc);
			// console.log("Create Project Success!");
			res.redirect('/project');
		});
	}
});




var project_title;

// workspace part
app.get('/workspace', function(req, res){
	
	var project_val;    
	project_title = req.param('data');
	console.log('get!!');
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
	//                var start = bodyCode.indexOf('\<body\>');
	//                var end = bodyCode.indexOf('\</body\>');
	//                bodyCode = bodyCode.slice(start+8, end);

				console.log(bodyCode);
				ComponentDB.find({},function(error,comDoc){
					var comTitle = new Array(), comHead = new Array(), comBody = new Array();
					for(var j = 0 ; j< comDoc.length ; j++){
						comTitle[j]=comDoc[j].title; comHead[j]=comDoc[j].head; comBody[j]=comDoc[j].body;
					}
					res.render('workspace', {val : bodyCode, comTitle : comTitle, comHead : comHead, comBody : comBody});
				});

				break;
			}
		}
	});
});

app.post('/workspace', function(req, res){

	var project_val = beautify_html(req.body.data, { indent_size: 2 });
	var type = req.body.type;

	if(type == 'export'){
		console.log('export Start');
		console.log('폴더를 생성합니다.');
		mkdir('./public/workspaces/'+project_title, function(err){
			console.log(err);
		});

		var file = './public/workspaces/'+project_title+'/index.html';

		fs.open(file, 'w', function(err, fd){
			if(err) throw err;
			console.log('file open complete');

			fs.writeFile(file, beautify_html(req.body.data, { indent_size: 2 }), 'utf-8', function(err){
			 if(err) throw err;
			 console.log("file write complete");
		 });
		});    

		var file2 = './public/workspaces/'+project_title+'/style.css';
		fs.open(file2, 'w', function(err, fd){
				if(err) throw err;
				console.log('file2 open complete');

				fs.writeFile(file2, beautify_css(req.body.cssData, { indent_size: 2 }), 'utf-8', function(err){
					 if(err) throw err;
						console.log("Css file2 write complete");
				});
		});
	}
	else if(type == 'save'){
		console.log('save Start');
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
	}
	else if(type == 'share'){
		console.log('폴더를 생성합니다.');
		mkdir('./public/workspaces/share/'+project_title, function(err){
			console.log(err);
		});


		TempletDB.create({title: project_title, val: req.body.data, html: req.body.bodyCode, css: req.body.css },function(err,data){
			console.log(err);
		});

		var indexFile = './public/workspaces/share/'+project_title+'/index.html';

		fs.open(indexFile, 'w', function(err, fd){
			if(err) throw err;
			
			fs.writeFile(indexFile, beautify_html(req.body.bodyCode, { indent_size: 2 }), 'utf-8', function(err){
			 if(err) throw err;
		 });
		});

		var file = './public/workspaces/share/'+project_title+'/style.css';

		fs.open(file, 'w', function(err, fd){
			if(err) throw err;

			fs.writeFile(file, beautify_css(req.body.css, { indent_size: 2 }), 'utf-8', function(err){
			 if(err) throw err;
		 });
		});
		
		

	}

});


app.get('/test', function(req, res){
	res.render('test', {user_id : checkedID});
});


app.get('/make', function(req, res){
 res.render('make');
});


app.get('/templet', function(req, res){
	var titles = new Array();
	TempletDB.find({},function(error,doc){
			// var comTitle = new Array(), comHead = new Array(), comBody = new Array();
			

			for(var i = 0; i < doc.length; i++){
				titles[i] = doc[i].title;
			}

			console.log(titles);
			res.render('templet', {user_name : checkedName, projects : projects, titles : titles});
	});
})

app.post('/templet', function(req, res){
	var project_name = req.body.input_project_name;
	var selected = req.body.selected;
	var val;
	var html;
	var css;

	// TempletDB.findOne({title : selected}, function(err, templet_doc){
	// 		console.log("Find Templet");
	// 		console.log(templet_doc);
	// 		if(err){
	// 			throw err;
	// 		}

	// 		val = templet_doc.get('val', String);
	// 		html = templet_doc.get('html', String);
	// 		css = templet_doc.get('css', String);
		
	// 	});
			
	User.findOne({id : checkedID}, function(err, doc){

		var promise = new Promise(function(resolve, reject){
			TempletDB.findOne({title : selected}, function(err2, templet_doc){
				console.log("Find Templet");
				console.log(templet_doc);
				if(err2){
					throw err2;
				}

				val = templet_doc.get('val', String);
				html = templet_doc.get('html', String);
				css = templet_doc.get('css', String);

				console.log("Find id")
					if(err){ 
						throw err;
					}
				console.log('val!!!');
				console.log(val);
				projects = doc.get('projects');
				doc.projects.push({title : project_name, val : val});
				doc.save();

				projects = doc.get('projects');
				for(var i = 0; i < projects.length; i++){
					titles[i] = projects[i]['title'];
				}


				mkdir('./public/workspaces/'+project_name, function(err){
					console.log(err);

						var indexFile2 = './public/workspaces/'+project_name+'/index.html';

					fs.open(indexFile2, 'w', function(err, fd){
						if(err) throw err;
						
						fs.writeFile(indexFile2, beautify_html(html, { indent_size: 2 }), 'utf-8', function(err){
						 if(err) throw err;
					 });
					});

					var cssfile = './public/workspaces/'+project_name+'/style.css';

					fs.open(cssfile, 'w', function(err, fd){
						if(err) throw err;

						fs.writeFile(cssfile, beautify_css(css, { indent_size: 2 }), 'utf-8', function(err){
						 if(err) throw err;
					 });
					});
				});

				console.log('make dir!');
				console.log(project_name);
				// var file = './public/workspaces/'+project_name+'/index.html';

				// fs.open(file, 'w', function(err, fd){
				// 	if(err) throw err;
				// 	console.log('file open complete');

				// 	fs.writeFile(file, "", 'utf-8', function(err){
				// 		if(err) throw err;
				// 		console.log("file write complete");
				//  });
				// });   
				


				// var indexFile2 = './public/workspaces/'+project_name+'/index.html';

				// fs.open(indexFile2, 'w', function(err, fd){
				// 	if(err) throw err;
					
				// 	fs.writeFile(indexFile2, beautify_html(html, { indent_size: 2 }), 'utf-8', function(err){
				// 	 if(err) throw err;
				//  });
				// });

				// var cssfile = './public/workspaces/'+project_name+'/style.css';

				// fs.open(cssfile, 'w', function(err, fd){
				// 	if(err) throw err;

				// 	fs.writeFile(cssfile, beautify_css(css, { indent_size: 2 }), 'utf-8', function(err){
				// 	 if(err) throw err;
				//  });
				// });



				res.redirect('/project');
				
				});	
			})


		
		// setTimeout(function(){}, 1000);

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
