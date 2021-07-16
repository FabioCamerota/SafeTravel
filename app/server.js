require('dotenv').config();
const express = require('express');  
const request = require('request');
const session = require('express-session');
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const Amadeus = require('amadeus'); //altrimenti request
const { image_search, image_search_generator } = require("duckduckgo-images-api");
const WebSocket = require('ws');

var app = express(); // Express configuration

app.use(express.static(__dirname + '/public')); // serve perchè altrimenti non si carica il file html che contiene la documentazione sulle Api esterne
//Non cambiare il nome della cartella public, altrimenti devi cambiarlo anche qui e anche sotto.
app.use(cors()); //cors policy

app.use(session({ //SESSION
	secret: 'RDC-progetto',
	resave: true,
	/*Forza la sessione a essere risalvata nel session store, anche se mai modificata nei request*/
	saveUninitialized: false,
	/*Forza una sessione non inizializzata a essere salvata. Se false aiuta con le race conditions*/
}));

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const port = 3000;

var amadeus = new Amadeus({
	clientId: process.env.AMADEUS_KEY,
	clientSecret: process.env.AMADEUS_SECRET
});

var client_id = process.env.CLIENT_ID_FB;
var client_secret = process.env.CLIENT_SECRET_FB;

var userdb = 'http://admin:admin@couchdb:5984/users/';
var itinerariesdb = 'http://admin:admin@couchdb:5984/itineraries/';

const GADB = fs.readFileSync('GlobalAirportDatabase.txt').toString().split("\n").map(function(v) {
	let values = v.split(":");
	let object = {
		IATA: values[1], 
		airport: values[2], 
		city: values[3], 
		country: values[4]
	}
	return object;
});

app.get('/', function(req,res) {
	if(typeof(req.session.user) != "undefined") {
		res.sendFile("home.html",{root:__dirname});
	}
	else
		res.sendFile("accesso.html",{root:__dirname});
});

app.get('/login', function(req,res) {
	//AUTHORIZATION REQUEST AL RESOURCE OWNER CON SCOPE
	res.redirect(`https://www.facebook.com/v10.0/dialog/oauth?response_type=code&scope=email&client_id=${client_id}&redirect_uri=https://localhost:3000/home&client_secret=${client_secret}`);
});

app.get('/logout', function(req, res){
	req.session.destroy();
	res.redirect('/');
});

app.get('/home', function(req,res) {
	if(req.query.error=='access_denied'){
		console.log("Non autorizzato");
		res.redirect('/');
	}
	else if(req.query.code != null || req.session.code != null) {
		var code= req.query.code;
		request.get({ //AUTHORIZATION GRANT ALL'AUTHORIZATION SERVER PER AVERE ACCESS TOKEN
			url:`https://graph.facebook.com/v10.0/oauth/access_token?client_id=${client_id}&redirect_uri=https://localhost:3000/home&client_secret=${client_secret}&code=${code}`
		}, function(err, res_get, body) {
			if (err) {
				return console.log('Auth failed: '+err);
			}
			var info = JSON.parse(body);
			if(info.error) {
				res.redirect("/");
			}
			else {
				userInfo(info.access_token).then(function(response) { //RICHIESTA AL RESOURCE SERVER CON ACESS TOKEN PER AVERE DATI UTENTE
					readCRUD(userdb, {"id": response.id}).then(function(res_read) { //verifico se l'utente già presente nel db
						updateCRUD(userdb, {"id": response.id, "nome": res_read.nome, "pic": response.pic, "mete": res_read.mete}).then(function(res_update) { //già presente
							req.session.user = {"id": response.id, "nome": res_read.nome, "pic": response.pic, "mete": res_read.mete};
							console.log("DONE /home ho fatto update dell'user: "+response.id);
							res.sendFile("home.html",{root:__dirname});	
						}).catch(function(err_update) {
							console.log("ERROR /home update user: "+err_update);
							res.redirect("/");
//							res.send("ERROR update user: "+err_update);
						});
					}).catch(function(err_read) { //non è presente
						createCRUD(userdb, {"id": response.id, "nome": response.name, "pic": response.pic, "mete": []}).then(function(res_create) {
							req.session.user = {"id": response.id, "nome": response.name, "pic": response.pic, "mete": []};
							console.log("DONE /home ho create un nuovo user: "+response.id);
							res.sendFile("home.html",{root:__dirname});
						}).catch(function(err_create) {
							console.log("ERROR /home create user: "+err_create);
							res.redirect("/");
//							res.send("ERROR create user: "+err_create);
						});
					});
				}).catch(function(err) {
					console.log("ERROR /home userInfo: "+err);
					res.redirect("/");
				});
			}
		});
	} 
	else {
		res.redirect("/");
	}
});

app.get('/GADB', function(req,res) {
	res.send(GADB);
});

app.get('/profilo', function(req, res) {
	if(typeof(req.session.user) != "undefined") {
		res.sendFile("profilo.html",{root:__dirname});
	}
	else
		res.sendFile("accesso.html",{root:__dirname});
});

app.get('/profilo_dati', function(req, res) {
	readCRUD(userdb, {"id":req.session.user.id}).then(function(res_readu) {
		req.session.user = {"id": res_readu._id, "nome": res_readu.nome, "pic": res_readu.pic, "mete": res_readu.mete};
		console.log("DONE /profilo_dati ho fatto la read e sto mandando: "); console.log(req.session.user);
		res.send(req.session.user);
	}).catch(function(err) {
		console.log("ERROR /profilo_dati: "+err);
		res.send("ERROR /profilo_dati: "+err);
	});
});

app.get('/mete', function(req,res) {
	if(typeof(req.session.user) != "undefined") {
		res.sendFile("mete.html",{root:__dirname});
	}
	else
		res.sendFile("accesso.html",{root:__dirname});
});

app.get('/cerca_itinerari', function(req,res) {
	cercaItinerari(req.query.origin,req.query.destination,req.query.departureDate).then(function(response){
		console.log("DONE /cerca_itinerari sto mandando: "); console.log(response.data);
		if(response.data.length == 0)
			res.send("Nessun itinerario trovato");
		else
			res.send(JSON.stringify(response.data));
	}).catch(function(responseError){
		console.log("ERROR /cerca_itinerari: "+responseError);
		res.send("L'itinerario non esiste");
	});
});

app.get('/meta_dettagli', function(req,res) {
/*	if(typeof(req.session.user) != "undefined") {
		console.log("QUERY: "+JSON.stringify(req.query));
		console.log("SESSION: "+JSON.stringify(req.session));
		res.sendFile("meta_dettagli.html",{root:__dirname});
	}
	else
		res.sendFile("accesso.html",{root:__dirname});
*/
	//Chiunque può accedere ai dettagli
	res.sendFile("meta_dettagli.html",{root:__dirname});
});

app.get('/meta_dettagli_data', function(req,res) {
	//id dell'itinerario in couchdb, per esempio BKK_AAR_2021-08-01_2690.90_EUR_PT19H_2021-08-01
	let id = "";
	for(key in req.query) {
		console.log(key);
		if(key == "disponib")
			id += req.query[key]
		else
			id += req.query[key]+"_"
	}
	console.log(req.query);
	cercaItinerari(req.query.origin,req.query.destination,req.query.departureDate).then(function(response){
		if(response.data.length == 0) {
			cancellaItinerarioScaduto(id).then(()=>	console.log("DONE /meta_dettagli_data aggiornato utenti e cancellato itinerario: "+id))
				.catch((err)=>console.log("ERROR /meta_dettagli_data cancellazione itinerario: "+err));
			console.log("Nessun itinerario trovato");
			res.send("Nessun itinerario trovato");
		}
		else {
			let itinerario = response.data.filter(function(v) {
				return v.itineraries[0].duration == req.query.durata &&
				v.lastTicketingDate == req.query.disponib &&
				v.price.grandTotal == req.query.prezzo;
			})[0];
			if(typeof(itinerario) == "undefined") { //Utente accede a questo url, ma la meta non esiste più, accade solo se tutti posti già prenotati, quindi amadeus non restituisce niente
				cancellaItinerarioScaduto(id).then(()=>	console.log("DONE /meta_dettagli_data aggiornato utenti e cancellato itinerario: "+id))
					.catch((err)=>console.log("ERROR /meta_dettagli_data cancellazione itinerario: "+err));
				console.log("Nessun itinerario trovato");
				res.send("Nessun itinerario trovato");
			}
			else { //ho trovato l'itinerario specifico richiesto
				console.log("DONE /meta_dettagli_data trovato itinerario sto mandando: "); console.log(itinerario);
				res.send(JSON.stringify(itinerario));
			}
		}
	}).catch(function(responseError){
		cancellaItinerarioScaduto(id).then(()=>	console.log("DONE /meta_dettagli_data aggiornato utenti e cancellato itinerario: "+id))
			.catch((err)=>console.log("ERROR /meta_dettagli_data cancellazione itinerario: "+err));
		console.log("ERROR /meta_dettagli_data cercaItinerari: "+responseError);
		res.send("Nessun itinerario trovato");
	});
});

app.get('/photo', function(req,res) {
	let place = req.query.place;
	image_search({ 
		query: place, 
		moderate: true 
	}).then(function(results) {
		for(let i = 0; i < results.length; i++) {
			if(results[i].image.includes("https:")) {
				console.log("DONE /photo sto mandando: "+results[i].image);
				res.send(results[i].image);
				break;
			}
		}
	}).catch(function(err) {
		console.log("ERROR /photo: "+err);
		res.send("ERROR /photo: "+err);
	});
});

app.get('/airline_data', function(req,res) {
	var code = req.query.code;
	amadeus.referenceData.airlines.get({
		airlineCodes : code
	}).then(function(response0){
		amadeus.referenceData.urls.checkinLinks.get({
			airlineCode : code
		}).then(function(response1) {
			var obj = {"airline": response0.data, "urls": response1.data};
			console.log("DONE /airline_data sto mandando: "); console.log(obj);
			res.send(obj);
		}).catch(function(response1Error){
			console.log("ERROR /airline_data in checkinLinks: "+response1Error);
			res.send(response1Error);
		});
	}).catch(function(response0Error){
		console.log("ERROR /airline_data in airlines: "+response0Error);
		res.send(response0Error);
	});
});

app.get('/preferito_aggiungi', function(req,res) {
	if(typeof(req.session.user) == "undefined") {
		res.sendFile("accesso.html",{root:__dirname});
		return;
	}

	let date = new Date();
	let y = date.getFullYear();
	let m = date.getMonth() + 1; if(m < 10) m = "0"+m;
	let d = date.getDate(); if(d < 10) d = "0"+d;
	date = y+"-"+m+"-"+d;
	if(req.query.disponib < date) { //se si tratta di un itinerario non valido
		console.log("ERROR /preferito_aggiungi la data dell'itinerario non è valida");
		res.send("Errore, itinerario non valido");
		return;
	}

	function aux() {
		readCRUD(userdb,{"id": req.query.user}).then(function(res_readu) { //...LEGGO POI I DATI DELL'UTENTE...
			let new_itineraries = res_readu.mete;
			new_itineraries.push(req.query.meta_id);
			let user = {
				"id": res_readu._id,
				"nome": res_readu.nome,
				"pic": res_readu.pic,
				"mete": new_itineraries
			}
			updateCRUD(userdb,user).then(function(res_updateu) { //...E AGGIORNO IL SUO ARRAY INSERENDO L'ITINERARIO.
				req.session.user.mete = new_itineraries;
				console.log("DONE /preferito_aggiungi update utente: "+user.id);
				res.send("useless data");
			}).catch(function(err_updateu) { console.log("ERROR /preferito_aggiungi update utente: "+err_updateu); res.send("useless data"); });
		}).catch(function(err_readu) { console.log("ERROR /preferito_aggiungi read utente: "+err_readu); res.send("useless data"); });
	}

	readCRUD(itinerariesdb, {"id": req.query.meta_id}).then(function(res_readi) { //L'ITINERARIO ESISTE IN DB...
		let obj = {
			"id": res_readi._id,
			"origin": res_readi.origin,
			"destination": res_readi.destination,
			"departureDate": res_readi.departureDate,
			"price": res_readi.price,
			"currency": res_readi.currency,
			"duration": res_readi.duration,
			"lastTicketingDate": res_readi.lastTicketingDate,
			"userN": res_readi.userN+1
		};
		updateCRUD(itinerariesdb, obj).then(function(res_updatei) { //...QUINDI AGGIORNO QUELL'ITINERARIO IN DB (userN+1)...
			aux();
			console.log("DONE /preferito_aggiungi update itinerario: "+obj.id);
		}).catch(function(err_updatei) { console.log("ERROR /preferito_aggiungi update itinerario: "+err_updatei); res.send("useless data"); });
	}).catch(function(err_readi) { //SE INVECE L'ITINERARIO NON ESISTE IN DB...
		let obj = {
			"id": req.query.meta_id,
			"origin": req.query.origin,
			"destination": req.query.destination,
			"departureDate": req.query.departureDate,
			"price": req.query.prezzo,
			"currency": req.query.currency,
			"duration": req.query.durata,
			"lastTicketingDate": req.query.disponib,
			"userN": 1
		};
		createCRUD(itinerariesdb,obj).then(function(res_createi) { //...LO CREO E LO INSERISCO IN DB...
			aux();
			console.log("DONE /preferito_aggiungi create itinerario: "+obj.id);
		}).catch(function(err_createi) { console.log("ERROR /preferito_aggiungi create itinerario: "+err_createi); res.send("useless data"); });
	});
});

app.get('/preferito_rimuovi', function(req,res) {
	if(typeof(req.session.user) == "undefined") {
		res.sendFile("accesso.html",{root:__dirname});
		return;
	}

	function aux() {
		readCRUD(userdb,{"id": req.query.user}).then(function(res_readu) { //...LEGGO POI I DATI DELL'UTENTE...
			let new_itineraries = res_readu.mete;

			index = new_itineraries.indexOf(req.query.meta_id);				
			new_itineraries.splice(index,1);					//creo nuovo array senza meta che utente ha eliminato

			let user = {
				"id": res_readu._id,
				"nome": res_readu.nome,
				"pic": res_readu.pic,
				"mete": new_itineraries
			}

			updateCRUD(userdb,user).then(function(res_updateu) { //...E AGGIORNO IL SUO ARRAY TOGLIENDO L'ITINERARIO.
				req.session.user.mete = new_itineraries;
				console.log("DONE update user: "+user.id);
				res.send("useless data");
			}).catch(function(err_updateu) { console.log("ERROR /preferito_rimuovi update user: "+err_updateu); res.send("useless data"); });
		}).catch(function(err_readu) { console.log("ERROR /preferito_rimuovi read user: "+err_readu); res.send("useless data"); });
	};

	readCRUD(itinerariesdb, {"id": req.query.meta_id}).then(function(res_readi) { //L'ITINERARIO ESISTE IN DB...
		let obj = {
			"id": res_readi._id,
			"origin": res_readi.origin,
			"destination": res_readi.destination,
			"departureDate": res_readi.departureDate,
			"price": res_readi.price,
			"currency": res_readi.currency,
			"duration": res_readi.duration,
			"lastTicketingDate": res_readi.lastTicketingDate,
			"userN": res_readi.userN-1											//decremento
		};

		if(obj["userN"] < 1) {													//nessun utente l'ha salvato									
			deleteCRUD(itinerariesdb,obj).then(function(res_deli){				//elimino da itineraries
				aux();
				console.log("DONE /preferito_rimuovi delete itinerario: "+obj.id);
			}).catch(function(err_deli) { console.log("ERROR /preferito_rimuovi delete itinerario: "+err_deli); res.send("useless data"); });
		}
		else{
			updateCRUD(itinerariesdb, obj).then(function(res_updatei) { //... AGGIORNO QUELL'ITINERARIO IN DB (almeno 1 utente lo ha salvato) ...
				aux();
				console.log("DONE read itinerario: "+obj.id);													
			}).catch(function(err_updatei) { console.log("ERROR /preferito_rimuovi update itinerario: "+err_updatei); res.send("useless data"); });
		}
	}).catch(function(err_readi) { //SE INVECE L'ITINERARIO NON ESISTE IN DB...(errore : in teoria ciò non può accadere)
		console.log("ERROR /preferito_rimuovi read itinerario: "+err_readi); res.send("useless data");
		res.send("useless data");
	});
});

app.get("/condividi",function(req,res){
	var data = req.query;
	console.log("DONE /condividi sto reindirizzando alla condivisione");
	res.send(`https://www.facebook.com/dialog/share?app_id=${process.env.CLIENT_ID_FB}&display=popup&href=https://127.0.0.1:3000/meta_dettagli?
		origin=${data.origin}%26destination=${data.destination}%26departureDate=${data.departureDate}%26prezzo=${data.prezzo}%26currency=${data.currency}%26
		durata=${data.durata}%26disponib=${data.disponib}&quote=Guarda che bel viaggio mi farò!`);
});

/*FUNZIONI AUSILIARIE---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

function cancellaItinerarioScaduto(id) {
	return new Promise(function(resolve,reject) {
		deleteCRUD(itinerariesdb, {"id": id}).then(function() { //cancello l'itinerario che ha quel id
			console.log("DONE cancellaItinerarioScaduto delete itinerario: "+id);
			readCRUD(userdb, {"id": "_all_docs?include_docs=true"}).then(function(res_readi) { //delete on cascade, prendo tutti gli utenti ed aggiorno l'array
				for(let i = 0; i < res_readi.total_rows; i++) {
					let new_user = {
						"id": res_readi.rows[i].id,
						"nome": res_readi.rows[i].doc.nome,
						"pic": res_readi.rows[i].doc.pic,
						"mete": res_readi.rows[i].doc.mete.filter(x=>x != id)
					}
					updateCRUD(userdb, new_user).then(()=>console.log("DONE cancellaItinerarioScaduto update user: "+new_user.id))
					.catch(function(err) {
						console.log("ERROR cancellaItinerarioScaduto update user id: "+new_user.id+" "+err);
						reject(err);
					});
				}
				console.log("DONE cancellaItinerarioScaduto read all users");
				resolve("Aggiornato");
			}).catch(function(err) {
				console.log("ERROR cancellaItinerarioScaduto read all users: "+err);
				reject(err);
			});
		}).catch(function(err) {
			console.log("ERROR cancellaItinerarioScaduto delete itinerario: "+err);
			reject(err);
		});
	});
}

function userInfo(token) {
	return new Promise(function(resolve,reject) {
		request.get({url:'https://graph.facebook.com/v10.0/me/?fields=name,email,id&access_token='+token}, function (err0, res0, body0) {
			if(err0) {
				console.log("ERROR userInfo richiesta dati: "+err0);
				reject("Errore di richiesta dati: "+err0);
			} 
			else {
				var info= JSON.parse(body0);
				request.get({url: `https://graph.facebook.com/v11.0/${info.id}/picture?redirect=false`}, function(err1, res1, body1) {
					if(err1) {
						console.log("ERROR userInfo richiesta picture: "+err1);
						reject("Errore get foto fb: "+err1);
					}
					else {
						let tosend = {
							"id": info.id,
							"name": info.name,
							"pic": JSON.parse(body1).data.url
						};
						console.log("DONE userInfo richiesta dati+picture sto mandando: "); console.log(tosend);
						resolve(tosend);
					}
				});				
			}
		});
	});
}

function cercaItinerari(origin, destination, departureDate) {
	return amadeus.shopping.flightOffersSearch.get({
			originLocationCode: origin,
			destinationLocationCode: destination,
			departureDate: departureDate,
			adults: '1'
		});
	
	//TESTING MODE:	
	var data = JSON.parse(fs.readFileSync('test_cerca_itinerari.json'));
	return new Promise(function(resolve,reject) {
		if(data.length > 0)
			resolve({"data": data});
		else
			reject("NONONO");
	});

}

function coronaTracker(countries) {
	return new Promise(function(resolve, reject){
		request.get({url:"http://api.coronatracker.com/v3/stats/worldometer/country"}, function(err0, res1, body0) {
			if(err0) {
				console.log("ERROR coronaTracker worldometer: "+err0);
				reject("Errore di richiesta dati");
			}
			else {
				request.get({url:"http://api.coronatracker.com/v1/travel-alert"}, function(err1, res1, body1) {
				if(err1) {
					console.log("ERROR coronaTracker travel-alert: "+err1);
					reject("Errore di richiesta dati");
				}
				else {
					console.log("DONE coronaTracker sto mandando dati relativi a: "+JSON.stringify(countries));
					resolve(JSON.parse(body0).filter(x=>countries.map(y=>y.replace(/%20/g, ' ').toUpperCase()).includes(x.countryName.toUpperCase())).map(function(x) {
						let alertMessage = "";
						let countryCode = x.countryCode;
						if(x.countryCode == null) {
							let tmp = JSON.parse(body1).find(y=>y.countryName.toUpperCase()==x.countryName.toUpperCase());
							console.log(tmp);
							countryCode = tmp.countryCode;
							console.log(tmp.countryCode);
							console.log(tmp.alertMessage);
							alertMessage = tmp.alertMessage;
						}
						else {
							alertMessage = JSON.parse(body1).find(y=>y.countryCode==x.countryCode).alertMessage;
						}
						let obj = {
								"countryCode": countryCode,
								"country": x.country,
								"countryName": x.countryName,
								"activeCases": x.activeCases,
								"lastUpdated": x.lastUpdated,
								"alertMessage": alertMessage
							}
							return obj;
						}));
					}
				});
			}
		});
	});
}

function tuttiItinerari() {
	let date = new Date();
	let y = date.getFullYear();
	let m = date.getMonth() + 1; if(m < 10) m = "0"+m;
	let d = date.getDate(); if(d < 10) d = "0"+d;
	date = y+"-"+m+"-"+d;
	return new Promise(function(resolve, reject){
		readCRUD(itinerariesdb, {"id": "_all_docs?include_docs=true"}).then(function(res_readi) { //prelevo tutti gli itinerari
			let tosend = {"itineraries": []}; //array di itinerari da mandare
			let todelete_id = []; //id degli itinerari da eliminare
			for(let i = 0; i < res_readi.total_rows; i++) {
				if(res_readi.rows[i].doc.lastTicketingDate < date) { //data non valida
					todelete_id.push(res_readi.rows[i].doc._id);
				}
				else {
					tosend.itineraries.push(
						{
							"id": res_readi.rows[i].doc._id,
							"origin": res_readi.rows[i].doc.origin,
							"destination": res_readi.rows[i].doc.destination,
							"departureDate": res_readi.rows[i].doc.departureDate,
							"price": res_readi.rows[i].doc.price,
							"currency": res_readi.rows[i].doc.currency,
							"duration": res_readi.rows[i].doc.duration,
							"lastTicketingDate": res_readi.rows[i].doc.lastTicketingDate,
							"userN": res_readi.rows[i].doc.userN
						}
					);
				}
			}
			for(let i = 0; i < todelete_id.length; i++) { //elimino tutti itinerari non validi
				cancellaItinerarioScaduto(todelete_id[i]).then(()=>	console.log("DONE tuttiItinerari aggiornato utenti e cancellato itinerario: "+todelete_id[i]))
					.catch((err)=>console.log("ERROR tuttiItinerari cancellazione itinerario: "+err));
			}
			console.log("DONE tuttiItinerari read all itineraries sto mandando: "); console.log(tosend);
			resolve(tosend);
		}).catch(function(err_readi) {
			let tosend = {"error":"Errore nel caricamento delle mete!"};
			console.log("ERROR tuttiItinerari read all itineraries: "+err_readi);
			reject(tosend);
		});
	});
}

/*WEBSOCKET---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

const httpServer = https.createServer(options, app);
const ws = new WebSocket.Server({ server: httpServer });

CLIENTS=[];
ws.on('connection', function(conn) {
	CLIENTS.push(conn);
	console.log("connessione open");
	conn.on('message', function(message) {
		console.log('ricevuto:  %s', message);
		sendAll(message);
	});

	conn.on('close', function() {
		console.log("connection closed");
		CLIENTS.splice(CLIENTS.indexOf(conn), 1);
	});
});

function sendAll(message) {
	for (var i=0; i < CLIENTS.length; i++) {
		var j=i+1;
		CLIENTS[i].send("Messaggio per il client "+j+": "+message);
	}
}

httpServer.listen(port, function() { 
    console.log(`In ascolto sulla porta ${port}`);
});

/*FUNZIONI CRUD---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

function createCRUD(db,obj) {
	let toinsert = {};
	for(let key in obj) { if(key != "id") toinsert[key] = obj[key];}
	return new Promise(function(resolve, reject){
		request({//url specificato con nome dal docker compose e non localhost
			url: db+obj.id,
			headers: {'content-type': 'application/json'}, 
			method: 'PUT',
			body: JSON.stringify(toinsert)
		}, function(error, res, body){
			if(res.statusCode == 201) { //INSERITO
				console.log("DONE createCRUD inserito: "+201);
				resolve(obj);
			} else if(res.statusCode == 409) {//Elemento già presente
				console.log("ERROR createCRUD già presente: "+409);
				updateCRUD(db,obj).then(function(resU) {
					console.log("DONE createCRUD fatto update visto che già presente");
					reject("DONE createCRUD fatto update visto che già presente");
				}).catch(function(errU) {
					console.log("ERROR createCRUD problema in updateCRUD: "+errU);
					reject("ERROR createCRUD problema in updateCRUD: "+errU);
				});
			}
			else {
				console.log("ERROR createCRUD: "+error);
				reject("ERROR createCRUD: "+error);
			}
		});
	});
}

function readCRUD(db,obj) {
	return new Promise(function(resolve, reject){
		request({//url specificato con nome dal docker compose e non localhost
			url: db+obj.id, 
			method: 'GET',
		}, function(error, res, body){
			if(error) {
				console.log("ERROR readCRUD: "+error);
				reject("ERROR readCRUD: "+error);
			}
			else if(res.statusCode != 200) {
				console.log("ERROR readCRUD: "+JSON.parse(body).error);
				reject(JSON.parse(body).error)
			}
			else{
				console.log("DONE readCRUD");
				resolve(JSON.parse(body));
			}
		});
	});
}

function updateCRUD(db,obj) {
	let toinsert = {};
	for(let key in obj) { if(key != "id") toinsert[key] = obj[key];}
	return new Promise(function(resolve, reject){
		readCRUD(db,obj).then(function(result) { //prelevo i dati
			toinsert["_rev"] = result._rev;	//aggiungo il _rev a obj per poter fare l'update (altrimenti da errore in accesso)
			request({//url specificato con nome dal docker compose e non localhost
				url: db+obj.id,
				method: 'PUT',
				body: JSON.stringify(toinsert), 
			}, function(error, res){
				if(error) {
					console.log("ERROR updateCRUD: "+error);
					reject("ERROR updateCRUD: "+error);
				}
				else if(res.statusCode != 201) { //non ho inserito
					console.log("ERROR updateCRUD non ho inserito: "+res.statusCode);
					reject("ERROR updateCRUD non ho inserito: "+res.statusCode);
				}
				else {
					console.log("DONE updateCRUD");
					resolve(true);
				}
			});
		}).catch(function(err){
			console.log("ERROR updateCRUD: "+err);
			reject("ERROR updateCRUD: "+err);
		});
	});
}

function deleteCRUD(db,obj) {
	return new Promise(function(resolve, reject){
		readCRUD(db,obj).then(function(result) { //prelevo i dati
			request({//url specificato con nome dal docker compose e non localhost
				url: db+obj.id+"?rev="+result._rev,
				method: 'DELETE',
			}, function(error, res) {
				if(error) {
					console.log("ERROR deleteCRUD: "+error);
					reject("ERROR deleteCRUD: "+error);
				}
				else if(res.statusCode != 200) {
					console.log("ERROR deleteCRUD non ho cancellato: "+res.statusCode);
					reject("ERROR deleteCRUD non ho cancellato: "+res.statusCode);
				}
				else {
					console.log("DONE deleteCRUD");
					resolve(true);
				}
			});
		}).catch(function(err) {
			console.log("ERROR deleteCRUD: "+err);
			reject("ERROR deleteCRUD: "+err);
		});
	});
}

/*API TERZE---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

app.get("/api",function(req,res){
	res.sendFile("./public/api.html",{root:__dirname});
});

//Itinerari, per casi----------------------------------------------------------------------------------------------------------------
app.get("/api/tuttiItinerari",function(req,res){
	//Nessuna origine o destinazione inserita
	if(typeof(req.query.origin) == 'undefined' && typeof(req.query.destination) == 'undefined' ){
		tuttiItinerari().then(function(res0){
			res.send(res0);
		}).catch(function(err){
			res.send(err);
		});
	}
	//Solo destinazione inserita
	else if(typeof(req.query.origin) == 'undefined' && typeof(req.query.destination) != 'undefined'){
		tuttiItinerari().then(function(res0){
			//let onlyDestination = res0.itineraries.filter(x => GADB.find(y=> y.IATA == x.destination).city == req.query.destination.toUpperCase() );
			let onlyDestination = res0.itineraries.filter(x => x.destination == req.query.destination.toUpperCase());			
			res.send({"itineraries": onlyDestination});
		}).catch(function(err){
			res.send(err);
		});
	}
	//Solo origine inserita
	else if(typeof(req.query.origin) != 'undefined' && typeof(req.query.destination) == 'undefined'){
		tuttiItinerari().then(function(res0){
			//let onlyOrigin = res0.itineraries.filter(x => GADB.find(y=> y.IATA == x.origin).city == req.query.origin.toUpperCase() );
			let onlyOrigin = res0.itineraries.filter(x => x.origin == req.query.origin.toUpperCase());			
			res.send({"itineraries": onlyOrigin});
		}).catch(function(err){
			res.send(err);
		});
	}
	//Origine e destinazione inserite
	else{
		tuttiItinerari().then(function(res0){
			//let both = res0.itineraries.filter(x => GADB.find(y=> y.IATA == x.origin).city == req.query.origin.toUpperCase() && GADB.find(y=> y.IATA == x.destination).city == req.query.destination.toUpperCase());
			let both = res0.itineraries.filter(x => x.origin == req.query.origin.toUpperCase() && x.destination == req.query.destination.toUpperCase());
			res.send({"itineraries": both});
		}).catch(function(err){
			res.send(err);
		});
	}
});

//Destinazione in ordine crescente di contagi----------------------------------------------------------------------------------------------------------------
app.get("/api/itinerariDatiCovid",function(req,res){
	tuttiItinerari().then(function(body){
		let countriesOnly = body.itineraries.map(el => GADB.find(x => x.IATA == el.destination).country);
		coronaTracker(countriesOnly).then(function(res0){
			let final = [];
			for(let i = 0; i < body.itineraries.length; i++) {
				let destinationOnly = res0.find(x => x.countryName.toUpperCase() == GADB.find(y => y.IATA == body.itineraries[i].destination).country);
				final.push(
					{
						"id": body.itineraries[i].id,
						"origin": body.itineraries[i].origin,
						"destination": body.itineraries[i].destination,
						"departureDate": body.itineraries[i].departureDate,
						"price": body.itineraries[i].price,
						"currency": body.itineraries[i].currency,
						"duration": body.itineraries[i].duration,
						"lastTicketingDate": body.itineraries[i].lastTicketingDate,
						"userN": body.itineraries[i].userN,
						"activeCases": destinationOnly.activeCases,
						"lastUpdated": destinationOnly.lastUpdated,
						"alertMessage": destinationOnly.alertMessage
					}
				);
			}
		let toSend = {"itineraries":final.sort(function(a,b){
			return a.activeCases - b.activeCases;
		})};
		res.send(toSend);

		}).catch(function(err){
			let tosend = {"error":"Errore nel caricamento delle mete più gettonate!"};
			res.send(tosend);
		});		
	}).catch(function(err){
		let tosend = {"error":"Errore nel caricamento delle mete più gettonate!"};
		res.send(tosend);
	});
});

//Itinerari con dati covid della destinazione aggiornati in tempo reale----------------------------------------------------------------------------------------------------------------
app.get("/api/datiCovidPaesi", function(req,res) {
	console.log(req.query.countries);
	if(typeof(req.query.countries) == "undefined") {
		res.send({"error": "Errore, inserire almeno un paese!"});
	}
	else if(Array.isArray(req.query.countries)) {
		let bool = 0; //controllo se array vuoto o no
		for(let i = 0; i < req.query.countries.length; i++) { 
			if(req.query.countries[i].length==0) bool++; 
			console.log(req.query.countries[i].length); 
		}
		if(bool == req.query.countries.length) {res.send({"error": "Errore, inserire almeno un paese!"}); return; }
		
		coronaTracker(req.query.countries).then(function(res1){
			res.send({"data": res1});
		}).catch(function(err){
			console.log(err);
			res.send({"error": "Errore nel caricamento dei dati covid!"});
		});
	}
	else {
		coronaTracker([req.query.countries]).then(function(res1){
			res.send({"data": res1});
		}).catch(function(err){
			console.log(err);
			res.send({"error": "Errore nel caricamento dei dati covid!"});
		});
	}
});