require('dotenv').config();
const express = require('express');  
const request = require('request');
const session = require('express-session');
const fs = require('fs');
const https = require('https');
const cors = require('cors');

var app = express(); // Express configuration
//app.use(cors()); //cors policy
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

var client_id = process.env.CLIENT_ID_FB;
var client_secret = process.env.CLIENT_SECRET_FB;


app.get('/', function(req,res) {
	if(typeof(req.session.passport) != "undefined" && typeof(req.session.passport.user) != "undefined") {
		console.log("QUERY: "+JSON.stringify(req.query));
		console.log("SESSION: "+JSON.stringify(req.session));
		res.sendFile("home2.html",{root:__dirname});
	}
	res.sendFile("home.html",{root:__dirname});
});

app.get('/login', function(req,res) {
	res.redirect(`https://www.facebook.com/v10.0/dialog/oauth?response_type=code&scope=email&client_id=${client_id}&redirect_uri=https://localhost:3000/home&client_secret=${client_secret}`);
});

app.get('/home', function(req,res) {
	if(req.query.error=='access_denied'){
		console.log("Non autorizzato");
		res.redirect('/');
	}
	else if(req.query.code!=null || req.session.code!=null){
		var code= req.query.code;
		request.get({
			url:`https://graph.facebook.com/v10.0/oauth/access_token?client_id=${client_id}&redirect_uri=https://localhost:3000/home&client_secret=${client_secret}&code=${code}`
		}, function(err, res_get, body) {
			if (err) {
				return console.error('Auth failed:', err);
			}
			var info = JSON.parse(body);
			console.log("QUERY:"+JSON.stringify(req.query));
			console.log("BODY:"+body);
			if(info.error) {
				res.redirect("/failure");
			}
			else {
				/*console.log('Upload successful!  Server responded with:', body);
				getDati(info.access_token).then(function(infoPromise) {
					req.session.id_cliente = infoPromise.id;
					req.session.code = code;
					req.session.a_t= info.access_token;
					var id = req.session.id_cliente;
					var ss = req.sessionID;
					var nomecognome= infoPromise.name;
					var nome= nomecognome.split(" ")[0];
					var cognome = nomecognome.split(" ")[1];
					var aggiorna = aggiorna_sessione(id, ss, nome, cognome);
					aggiorna.then(function(result){
						if(result){
							res.sendFile("home.html",{root:__dirname});
						}
						else{
							res.redirect(pagina_root);
							console.log("Variabile di sessione non cambiata o inizializzata");
						}
					})
				});*/
//				res.redirect("/failure");
				req.session.token = JSON.parse(body).access_token;
				res.sendFile("home2.html",{root:__dirname});
			}
		});
	} 
	else {
		res.redirect("/");
	}
});

app.get('/logout', function(req, res){
	res.send("LOGOUT");
});

app.get('/failure', function(req,res) {
	console.log("failure");
	console.log(req.session);
	res.send(JSON.stringify(req.session));
});

app.get('/user_info', function(req,res) {
	console.log(req.session);
	if(typeof(req.session) != "undefined" && typeof(req.session.token) != "undefined") {
		request.get({url:'https://graph.facebook.com/v10.0/me/?fields=name,email,id,birthday,hometown&access_token='+req.session.token}, function (err, res_get, body) {
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