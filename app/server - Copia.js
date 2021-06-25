require('dotenv').config();
const express = require('express');  
const request = require('request');
const session = require('express-session');
const fs = require('fs');
const https = require('https');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const cors = require('cors');

var app = express(); // Express configuration

app.use(cors()); //cors policy
app.use(passport.initialize()); // Initialize Passport and restore authentication state, if any, from the...
//app.use(passport.session()); // ...session, posso usare cookie

app.use(session({ //SESSION
	secret: 'RDC-progetto',
	resave: true,
	saveUninitialized: false,
}));

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

port = 3000;

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

console.log(process.env);
console.log(process.env.CLIENT_ID_FB);
console.log(process.env.CLIENT_SECRET_FB);

passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_ID_FB,
    clientSecret: process.env.CLIENT_SECRET_FB,
    callbackURL: "https://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
	console.log(profile);
	/*findOrCreateUser(profile).then(function(user) { 
		console.log(user);
		done(null,user); //adesso richiamo serializeUser con done
	});*/
	updateUser(profile,accessToken).then(function(user) {
		console.log(user);
		done(null,user);
	});
  }
));

app.get('/', function(req,res) {
	if(typeof(req.session.passport) != "undefined" && typeof(req.session.passport.user) != "undefined") {
		console.log("QUERY: "+JSON.stringify(req.query));
		console.log("SESSION: "+JSON.stringify(req.session));
		res.sendFile("home2.html",{root:__dirname});
	}
	res.sendFile("home.html",{root:__dirname});
});

app.get('/login', passport.authenticate('facebook', { scope: ['read_stream', 'publish_actions'] }));

app.get('/logout', function(req, res){
	req.logout();
	res.clearCookie('express:sess');
	res.clearCookie('express:sess.sig');
	console.log("QUERY: "+JSON.stringify(req.query));
	console.log("SESSION: "+JSON.stringify(req.session));
	res.redirect('/');
});

app.get('/failure', function(req,res) {
	console.log("failure");
	res.send("failure");
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['read_stream', 'publish_actions'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/failure' }),
  function(req, res) {
	console.log(req);
    // Successful authentication, redirect home.
	res.redirect("https://localhost:3000/");
  });

app.get('/user_info', function(req,res) {
	console.log(req.session);
	if(typeof(req.session.passport) != "undefined" && typeof(req.session.passport.user) != "undefined") {
		request.get({url:'https://graph.facebook.com/v10.0/me/?fields=name,email,id,birthday,hometown&access_token='+req.session.passport.user.token}, function (err, res_get, body) {
	//	request.get({url:'https://graph.facebook.com/v10.0/me/photos?access_token='+req.session.passport.user.token}, function (err, res_get, body) {
			if(err) {
				reject("Errore di richiesta dati");
			} else {
				var info= JSON.parse(body);
				res.send(info);
			}
		});
	}
	else res.redirect("https://localhost:3000/user_info");
});

function updateUser(profile, accessToken) {
	return new Promise(function(resolve, reject){
		request({//url specificato con nome dal docker compose e non localhost
			url: 'http://admin:admin@couchdb:5984/users/'+profile.id, 
			method: 'GET'
		}, function(error, res_get, body){
			if (res_get.statusCode == 404) { //NON ESISTE, INSERISCO CON UNA PUT
				request({//url specificato con nome dal docker compose e non localhost
					url: 'http://admin:admin@couchdb:5984/users/'+profile.id, 
					method: 'PUT',
					headers: {'content-type': 'application/json'},
					body: `{"token: "${accessToken}", "nome": "${profile.displayName}","mete":[]}`
				}, function(error, res_put, body){
					if(res.statusCode == 201) { //INSERITO
						var user = {
							"id": profile.id,
							"token": accessToken,
							"nome": profile.displayName,
							"mete": []
						};
						resolve(user);		
					}
					else {
						console.log(error);
						console.log(res_put.statusCode, body);
						reject("Errore, codice: "+res_put.statusCode);
					}
				});
			}
			else if(res_get.statusCode == 200) { //TROVATO, AGGIORNO ACCESSTOKEN
				request({
					url: 'http://admin:admin@couchdb:5984/users/'+profile.id,
					method: 'PUT',
					body: `{"_rev": "${JSON.parse(res_get.body)._rev}", "token": "${accessToken}", "nome": "${profile.displayName}","mete":[]}`
				}, function(error, res_put, body){
					if(res_put.statusCode == 201) { //INSERITO
						var user = {
							"id": JSON.parse(res_get.body)._id,
							"token": accessToken,
							"nome": JSON.parse(res_get.body).nome,
							"mete": JSON.parse(res_get.body).mete
						};
						resolve(user);		
					}
					else {
						console.log(error);
						console.log(res_put.statusCode, body);
						reject("Errore, codice: "+res_put.statusCode);
					}
				});
			}
			else {
				console.log(error);
				console.log(res_get.statusCode, body);
				reject("Errore, codice: "+res_get.statusCode);
			}
		});
	});
}


function findOrCreateUserNOUPDATE(profile) {
	return new Promise(function(resolve, reject){
		request({//url specificato con nome dal docker compose e non localhost
			url: 'http://admin:admin@couchdb:5984/users/'+profile.id, 
			method: 'GET'
		}, function(error, res, body){
			if (res.statusCode == 404) { //NON ESISTE, INSERISCO CON UNA PUT
				request({//url specificato con nome dal docker compose e non localhost
					url: 'http://admin:admin@couchdb:5984/users/'+profile.id, 
					method: 'PUT',
					body: `{"nome": "${profile.displayName}","mete":[]}`
				}, function(error, res, body){
					if(res.statusCode == 201) { //INSERITO
						var user = {
							"id": profile.id,
							"nome": profile.displayName,
							"mete": []
						};
						resolve(user);		
					}
					else {
						console.log(error);
						console.log(res.statusCode, body);
						reject("Errore, codice: "+res.statusCode);
					}
				});
			}
			else if(res.statusCode == 200) { //TROVATO
				var user = {
					"id": JSON.parse(res.body)._id,
					"nome": JSON.parse(res.body).nome,
					"mete": JSON.parse(res.body).mete
				};
				resolve(user);
			}
			else {
				console.log(error);
				console.log(res.statusCode, body);
				reject("Errore, codice: "+res.statusCode);
			}
		});
	});
}

https.createServer(options, app).listen(port);