/**
 *  main entry point for express application
 *  Agile Data Vault Modeler
 */

var express = require('express');

var app = express();

app.set('port', process.env.PORT || 3000);

app.use('/public', express.static(__dirname + '/public'));

// set up handlebars view engine

var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// set up session handling

app.use(require('cookie-parser')("cookieSecret"));
app.use(require('express-session')({resave:true, saveUninitialized:false, secret:'keks'}));

// set up database connection

var dbHost = process.env.DB_HOST || "127.0.0.1";
var dbPort = process.env.DB_PORT || 5984;
var dbName = process.env.DB_NAME || "vault";
var couchdb = require('felix-couchdb');
var dbUser = process.env.DB_USER || 'couchdb';
var dbPwd = process.env.DB_PWD || 'couchdb'
var client = couchdb.createClient(dbPort, dbHost, dbUser, dbPwd);
var db = client.db(dbName);

// parser for HTTP requests

var bodyParser = require('body-parser');
app.use(bodyParser.json());

// hash functions

var crypto = require('crypto');

// file system

var fs = require('fs');

// Zip Utility

var Zip = require('adm-zip');

// Logging

var winston = require('winston');
winston.level = process.env.LOG_LEVEL || 'debug';
var logDir =  process.env.LOG_DIRECTORY || '/var/log/';
const env = process.env.NODE_ENV || 'development';

const tsFormat = new Date().toLocaleTimeString();
const logger = new (winston.Logger)({
	  transports: [
	    // colorize the output to the console
	    new (winston.transports.Console)({
	      timestamp: tsFormat,
	      colorize: true,
	      level: 'info'
	    })
	  ]
});


var artefactFactory = require('./lib/artefact.js');

// helper functions

function encrypt(user, pwd) {
	return crypto.createHash('md5').update(user.trim() + "+++++" + pwd.trim()).digest('hex');
}

function respond(err, response) {if(err) return {status:err}; else return {status:"ok"};}

function glyph(role) {
	if(role == "simple") return "glyphicon-pawn";
	else return "glyphicon-king";
}

function addToZip(zipFile, contentList, fileNameList, res) {
	if(contentList.length > 0) {
		var content = contentList.pop();
		var fileName = "/tmp/" + fileNameList.pop();
		
		fs.writeFile(fileName, content, function(err) {
			if(err) console.log("the error is " + err);
			else {
				zipFile.addLocalFile(fileName);
				addToZip(zipFile, contentList, fileNameList, res);
			}
		});
	}
	else {
		zipFile.writeZip("/tmp/project.zip");
		res.set({
    	    "Content-Disposition": "attachment;filename=project.zip",
    	    "Content-Type": "application/zip"
		});
    	
		res.sendFile("/tmp/project.zip");
	}
}

function advanced(groups) {
	var result = [];
	for(var i = 0; i < groups.length; i++) {
		if(groups[i].role == "advanced") result.push({name:groups[i].group});
	}
	
	return result;
}

function isInGroup(groups, name) {
	for(var i = 0; i < groups.length; i++) {
		if(groups[i].group == name) return true;
	}
	
	return false;
}

// standard page rendering

app.post('/register', function(req, res){
	if(req.body.user && req.body.pwd) {
		db.getDoc('user', function(err, userList){
			if(err) {
				res.send({error:"unable to register"});
				logger.log('error', 'Error during registration', {error: err});
			}
			else {
				var found = false;
				
				for(var i = 0; i < userList.allUser.length; i++) {
					if(userList.allUser[i].user == req.body.user) {
							userList.allUser[i].user = {user:req.body.user, pwd:encrypt(user, req.body.pwd)};
							found = true;
							break;
					}
				}
				
				if(!found) userList.allUser.push({user:req.body.user, pwd:encrypt(req.body.user, req.body.pwd), memberOf:[]});
				db.saveDoc(userList, function(err,response){
					if(err) res.send({error:"unable to register"});
					else {
						req.session.userId = req.body.user;
						req.session.groups = [];
						if(req.session.userId == process.env.advm_admin) req.session.admin = process.env.advm_admin;
						logger.log('info', 'Registration: ' + req.session.userId);
						res.send({success:"user registered"});
					}
				});
			}
		});
	
	}
	else res.send({error:"incorrect data"});
});

app.post('/signin', function(req, res){
	
	if(req.body.user && req.body.pwd) {
		db.getDoc('user', function(err, userList){
			if(err) res.send({error:"unable to signin"});
			else {
				var found = false;
				var givenUser = req.body.user.trim();
				for(var i = 0; i < userList.allUser.length; i++) {
					if(userList.allUser[i].user == givenUser && userList.allUser[i].pwd == encrypt(givenUser, req.body.pwd)) {
						found = true;
						req.session.userId = givenUser;
						req.session.groups = userList.allUser[i].memberOf;
						req.session.advanced = advanced(req.session.groups).length;
						logger.log('info', 'session is set for user ' + req.session.userId);
						if(req.session.userId == process.env.advm_admin) req.session.admin = process.env.advm_admin;
						
						res.send({user:givenUser});
					}
				}
				
				if(!found) res.send({error:"unable to login"});
			}
		});
	}
});

// protect all pages when user is not signed in

app.use(function(req, res, next){
	if(req.session.userId) next();
	else res.render('index',{});
});

app.get('/', function(req, res){
	db.view('vault', 'by_name',{"user":req.session.userId}, function(err,result){
		if(err) {
			logger.log('error', err);
			res.render('index',{message:err});
		}
		else {
			var models = [];
			for(var i = 0; i < result.rows.length; i++) {
				if(isInGroup(req.session.groups, result.rows[i].value.group)) models.push(result.rows[i].value);
			}
			
			res.render('index', {user:req.session.userId, admin:req.session.admin, models:models, advanced:req.session.advanced});
		}
	});
});

app.get('/canvas/:id', function(req, res){
	db.getDoc(req.params.id, function(err,model){
		if(!err) {
			req.session.model = model;
			res.render('canvas', {modelName:model.properties.name, configuration:req.session.configuration, user:req.session.userId, admin:req.session.admin});	
		}
	});
});

app.get('/property/:id', function(req, res){
	db.getDoc(req.params.id, function(err,model){
		if(!err) {
			req.session.model = model;
			db.getDoc('configuration', function(err2, configuration){
				var advancedGroups = advanced(req.session.groups).map(function(g){return g.name;});
				if(!err2 && advancedGroups.indexOf(model.properties.group) >= 0) res.render('property', {p:model.properties, c:configuration, user:req.session.userId, admin:req.session.admin, modelId:req.params.id,
													dts:artefactFactory.getDataTypes(configuration), groups:advanced(req.session.groups)});
			});	
		}
	});
});

app.get('/property', function(req, res){
	db.getDoc('configuration', function(err, configuration){
		var advancedLength = advanced(req.session.groups).length;
		if(!err && advancedLength > 0) res.render('property', {c:configuration, user:req.session.userId, admin:req.session.admin, dts:artefactFactory.getDataTypes(configuration), groups:advanced(req.session.groups)});
	});	
});

app.get('/version/:id', function(req, res){
	db.getDoc(req.params.id, function(err,model){
		if(!err) {
			req.session.model = model;
			res.render('version', {modelName:model.properties.name, user:req.session.userId, admin:req.session.admin});	
		}
	});
});

app.get('/user', function(req, res){
	if(req.session.userId == process.env.advm_admin) res.render('user', {user:req.session.userId});	
});

app.get('/user/data', function(req, res){
	db.getDoc('user', function(err,userData){
		if(!err) {
			var groups = [];
			
			for(var i = 0; i < userData.allGroups.length; i++) {
				var groupName = userData.allGroups[i];
				var member = [];
				for(var j = 0; j < userData.allUser.length; j++) {
					for(var k = 0; k < userData.allUser[j].memberOf.length; k++) {
						if(userData.allUser[j].memberOf[k].group == groupName) {
							member.push({user:userData.allUser[j].user, role:userData.allUser[j].memberOf[k].role, icon:glyph(userData.allUser[j].memberOf[k].role)});
							break;
						}
					}
				}
				
				groups.push({"name":groupName, "ref":"#" + groupName, "member":member});
				
			}
			res.send({"user":userData.allUser, "groups":groups});
		}
	});
});

app.get('/member/:action/:user/:group', function(req, res){
	db.getDoc('user', function(err,userData){
		if(!err) {
			for(var i = 0; i < userData.allUser.length; i++) {
				if(userData.allUser[i].user == req.params.user) {
					if(req.params.action == "add") userData.allUser[i].memberOf.push({"group":req.params.group, "role":"simple"});
					else {
						var index;
						for(var j = 0; j < userData.allUser[i].memberOf.length; j++) {
							if(userData.allUser[i].memberOf[j].group == req.params.group) {
								index = j;
								break;
							}
						}
						
						if(req.params.action == "remove") userData.allUser[i].memberOf.splice(j, 1);
						else {
							var formerRole = userData.allUser[i].memberOf[index].role;
							if(formerRole == "simple") userData.allUser[i].memberOf[index].role="advanced"; else userData.allUser[i].memberOf[index].role ="simple";
						}
					}
				}
			}
			
			db.saveDoc('user', userData, function(err2,response){
				if(err2) res.send({error:err2}); else return res.send({"status":"ok"});
			});
		}
		else res.send({error:err});
	});
});

// service requests

app.get('/signout', function(req, res){
	req.session.userId = null;
	req.session.groups = null;
	req.session.model = null;
	req.session.configuration = null;
	req.session.admin = null;
	res.send({status:"signedOut"});
});

app.get('/:action/group/:groupName', function(req, res){
	db.getDoc('user', function(err,userData){
		if(!err) {
			if(req.params.action == "create") userData.allGroups.push(req.params.groupName);
			else userData.allGroups.splice(userData.allGroups.indexOf(req.params.groupName), 1);
				
			db.saveDoc('user', userData, function(err2,response){
				if(err2) res.send({error:err2}); else return res.send({"status":"ok"});
			});
		}
		else res.send({error:err});
	});
});

app.get('/model', function(req, res){
	res.send(req.session.model);
});

app.post('/model/:id', function(req, res){
	if(req.body._rev) delete req.body._rev;
	db.getDoc(req.params.id, function(err, model){
		if(!err) {
			var newModel = req.body;
			newModel._rev = model._rev;
			db.saveDoc(req.params.id, newModel, function(err,response){res.send(respond(err, response))});
		}
		else res.send({status:"Model to be updated was not found."});
	});
	
});

app.post('/create/:id', function(req, res){
	db.getDoc(req.params.id, function(err, model){
		if(err) res.send({error:err});
		else {
			var withRelease = artefactFactory.createRelease(model, req.body, logger);
			
			db.saveDoc(req.params.id, withRelease.model, function(err,response){
				if(err) res.send({error:err}); else return res.send(withRelease.latest);
			});
		}
	});
});

app.post('/check', function(req, res){
	var testResult = artefactFactory.parseTemplate(req.body.term);
	if(testResult.exception) res.send({status:"failed"}); else res.send({status:"ok"});
});

app.post('/properties/:id', function(req, res){
	db.getDoc(req.params.id, function(err, model){
		if(err) res.send({error:err});
		else {
			model.properties = req.body;
			db.getDoc('configuration', function(err2, configuration){
				if(!err2) db.saveDoc(req.params.id, artefactFactory.improveModel(model, configuration), function(err,response){res.send(respond(err, response))});
			});
		};
	});
});

app.post('/properties', function(req, res){
	var model = {user:req.session.userId, properties:req.body, views:[], versions:[]};
	db.getDoc('configuration', function(err2, configuration){
		if(!err2) db.saveDoc(artefactFactory.improveModel(model, configuration), function(err,response){res.send(respond(err, response))});
	});
});

app.get('/remove/:id', function(req,res){
	db.getDoc(req.params.id, function(err, model){
		if(err) res.send({error:err});
		else {
		 db.removeDoc(model._id, model._rev);
		 req.session.model = null;
		 res.send({status:"deleted"});
		}
	});
});

app.get('/artefacts/:id/:version', function(req,res){
	
	var content = "";
	var fileName = "unknown.txt";
	var hanaFunctions = [];
	var functionNames = [];
	
	db.getDoc(req.params.id, function(err, model){
		if(err) res.send({error:err});
		else {
			
			fileName = artefactFactory.fileName(model);
			
			for(var i = 0; i < model.versions.length; i++) {
				if(model.versions[i].name == req.params.version) {
					
					var version = model.versions[i];
					content = version.header;
					for(var j = 0; j < version.artefacts.length; j++) {
						content = content + "\n\n" + version.artefacts[j];
					}
					
					content = content + "\n\n" + version.footer;
					
					for(var j = 0; j < version.hashFunctions.length; j++) {
						if(model.properties.targetSystem == "sapHana") {
							hanaFunctions.push(version.hashFunctions[j].f);
							functionNames.push(version.hashFunctions[j].name);
						}
						else content = content + "\n\n" + version.hashFunctions[j].f;
					}
					
					break;
				}
			}
			
			if(model.properties.targetSystem == "sapHana") {
				var zipFile = new Zip();
				hanaFunctions.push(content);
				functionNames.push(fileName);
				
				addToZip(zipFile, hanaFunctions, functionNames, res);
			}
			else {
				fs.writeFile("/tmp/" + fileName, content, function(err) {
				    if(err) logger.log('error', err);
				    else {
				    	res.set({
				    	    "Content-Disposition": "attachment;filename=" + fileName,
				    	    "Content-Type": "text/plain"
				    	});
				    	res.sendFile("/tmp/" + fileName);
				    }
				    
				    logger.log('info', 'The file ' + fileName + ' was saved.');
	
				});
			}
		}
	}); 
});

// custom 404 page

app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

//custom 500 page

app.use(function(err, req, res, next){
	logger.log('error', err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
	logger.log('info', 'Express started on port ' + app.get('port'));
	logger.log('info', 'Administrator is ' + process.env.advm_admin);
});