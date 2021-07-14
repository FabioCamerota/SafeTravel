require('dotenv').config();
const express = require('express');  
const request = require('request');
const session = require('express-session');
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const Amadeus = require('amadeus');
const { image_search, image_search_generator } = require("duckduckgo-images-api");
const WebSocket = require('ws');

var app = express(); // Express configuration

app.use(express.static(__dirname + '/public')); // serve perchè altrimenti non si carica il file html che contiene la documentazione sulle Api esterne
//Non cambiare il nome della cartella public, altrimenti devi cambiarlo anche qui e anche sotto.
//app.use(express.urlencoded({ extended: false }));
app.use(cors()); //cors policy

app.use(session({ //SESSION
	secret: 'RDC-progetto',
	resave: true,
	saveUninitialized: false,
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
	else if(req.query.code!=null || req.session.code!=null) {
		var code= req.query.code;
		request.get({
			url:`https://graph.facebook.com/v10.0/oauth/access_token?client_id=${client_id}&redirect_uri=https://localhost:3000/home&client_secret=${client_secret}&code=${code}`
		}, function(err, res_get, body) {
			if (err) {
				return console.error('Auth failed:', err);
			}
			var info = JSON.parse(body);
			if(info.error) {
				res.redirect("/");
			}
			else {
				userInfo(info.access_token).then(function(response) {
					readCRUD(userdb, {"id": response.id}).then(function(res_read) {
						req.session.user = res_read;
						res.sendFile("home.html",{root:__dirname});						
					}).catch(function(err_read) {
						createCRUD(userdb, {"id": response.id, "nome": response.name, "mete": []}).then(function(res_create) {
							req.session.user = {"_id": response.id, "token": info.access_token, "nome": response.name, "mete": []};
							res.sendFile("home.html",{root:__dirname});
						}).catch((err_create)=>console.log(err_create));
					});
				}).catch(function(err) {
					console.log(err);
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
	//console.log(req.session);
	//console.log(req.session.user);
	readCRUD(userdb,{"id":req.session.user._id}).then(function(res_readu) {
		//console.log("READU--------------------------------");
		//console.log(res_readu);
		req.session.user = res_readu;
		//console.log("ASESSIONUSER--------------------------------");
		//console.log(req.session.user);
		//console.log("SENT DATA, DONE!--------------------------------");
		res.send(req.session.user);
	}).catch((err)=>console.log(err));
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
		if(response.data.length == 0)
			res.send("Nessun itinerario trovato");
		else
			res.send(JSON.stringify(response.data));
	}).catch(function(responseError){
		console.log(responseError.code);
		console.log(responseError);
		console.log("------------------");
		console.log(req.query);
		res.send("Errore nel server");
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
	res.sendFile("meta_dettagli.html",{root:__dirname});
});

app.get('/meta_dettagli_data', function(req,res) {
	console.log(req.query);
	cercaItinerari(req.query.origin,req.query.destination,req.query.departureDate).then(function(response){
		console.log(response.data);
		if(response.data.length == 0) {
			console.log("Nessun itinerario trovato");
			res.send("Nessun itinerario trovato");
		}
		else {
			let itinerario = response.data.filter(function(v) {
				return v.itineraries[0].duration == req.query.durata &&
				v.lastTicketingDate == req.query.disponib &&
				v.price.grandTotal == req.query.prezzo;
			})[0];
			console.log("sending");
			console.log(itinerario);
			res.send(JSON.stringify(itinerario));
		}
	}).catch(function(responseError){
		console.log(responseError.code);
		console.log("Errore nel server");
		res.send("Nessun itinerario trovato");
	});
});

app.get('/photo', function(req,res) {
	let place = req.query.place;
	image_search({ 
		query: place, 
		moderate: true 
	}).then(function(results) {
//		console.log(results[0]);
		for(let i = 0; i < results.length; i++) {
			if(results[i].image.includes("https:")) {
				res.send(results[i].image);
				break;
			}
		}
	}).catch(function(err) {
		console.log("Errore");
		res.send("ERRORE");
	});
});

app.get('/airline_data', function(req,res) {
	var code = req.query.code;
	
	amadeus.referenceData.airlines.get({
		airlineCodes : code
	}).then(function(response0){
		amadeus.referenceData.urls.checkinLinks.get({
			airlineCode : code
		}).then(function(response1){
			var obj = {"airline": response0.data, "urls": response1.data};
			console.log(JSON.stringify(obj));
			res.send(obj);
		}).catch(function(response1Error){
			console.log(responseError);
			res.send(responseError);
		});
	}).catch(function(response0Error){
		res.send(response0Error);
	});

	return;
	
	//TESTING MODE:
	var data = JSON.parse(fs.readFileSync('test_airline_data.json'));
	res.send(data);

});

app.get('/preferito_aggiungi', function(req,res) {

	function aux() {
		readCRUD(userdb,{"id": req.query.user}).then(function(res_readu) { //...LEGGO POI I DATI DELL'UTENTE...
			let new_itineraries = res_readu.mete;
			new_itineraries.push(req.query.meta_id);
			let user = {
				"id": res_readu._id,
				"token": res_readu.token,
				"nome": res_readu.nome,
				"mete": new_itineraries
			}
			updateCRUD(userdb,user).then(function(res_updateu) { //...E AGGIORNO IL SUO ARRAY INSERENDO L'ITINERARIO.
				console.log(req.session.user);
				req.session.user.mete = new_itineraries;
				console.log(req.session.user);
				res.send("useless data");
			}).catch(function(err_updateu) { console.log(err_updateu); res.send("useless data"); });
		}).catch(function(err_readu) { console.log(err_readu); res.send("useless data"); });
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
		}).catch(function(err_updatei) { console.log(err_updatei); res.send("useless data"); });
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
		}).catch(function(err_createi) { console.log(err_createi); res.send("useless data"); });
		console.log(err_readi)
	});
});

/*-------------------------------------------*/
app.get('/preferito_rimuovi', function(req,res) {
	function aux() {
		readCRUD(userdb,{"id": req.query.user}).then(function(res_readu) { //...LEGGO POI I DATI DELL'UTENTE...
			let new_itineraries = res_readu.mete;

			index = new_itineraries.indexOf(req.query.meta_id);				
			new_itineraries.splice(index,1);					//creo nuovo array senza meta che utente ha eliminato

			let user = {
				"id": res_readu._id,
				"token": res_readu.token,
				"nome": res_readu.nome,
				"mete": new_itineraries
			}

			updateCRUD(userdb,user).then(function(res_updateu) { //...E AGGIORNO IL SUO ARRAY TOGLIENDO L'ITINERARIO.
				req.session.user.mete = new_itineraries;
				console.log(req.session.user);
				res.send("useless data");
			}).catch(function(err_updateu) { console.log(err_updateu); res.send("useless data"); });
		}).catch(function(err_readu) { console.log(err_readu); res.send("useless data"); });
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

		if(obj["userN"] <1 ) {													//nessun utente l'ha salvato									
			deleteCRUD(itinerariesdb,obj).then(function(res_deli){				//elimino da itineraries
				console.log("Meta eliminata dalle preferite con successo!");
			}).catch(function(err_deli) { console.log(err_deli+": Errore DELETE ITINERARIES"); res.send("useless data"); });
			aux();																
		}
		else{
			updateCRUD(itinerariesdb, obj).then(function(res_updatei) { //... AGGIORNO QUELL'ITINERARIO IN DB (almeno 1 utente lo ha salvato) ...
				aux();													
			}).catch(function(err_updatei) { console.log(err_updatei+": Errore UPDATE ITINERARIES"); res.send("useless data"); });
		}
	}).catch(function(err_readi) { //SE INVECE L'ITINERARIO NON ESISTE IN DB...(errore : in teoria ciò non può accadere)
		console.log(err_readi+": Errore READ ITINERARIES"); res.send("useless data");
	});
});

app.get("/condividi",function(req,res){
	var data = req.query;
	console.log(data);
	res.send(`https://www.facebook.com/dialog/share?app_id=${process.env.CLIENT_ID_FB}&display=popup&href=https://127.0.0.1:3000/meta_dettagli?
		origin=${data.origin}%26destination=${data.destination}%26departureDate=${data.departureDate}%26prezzo=${data.prezzo}%26currency=${data.currency}%26
		durata=${data.durata}%26disponib=${data.disponib}&quote=Guarda che bel viaggio mi farò!`);	
});

/*-------------------------------------------*/

function userInfo(token) {
	return new Promise(function(resolve,reject) {
		request.get({url:'https://graph.facebook.com/v10.0/me/?fields=name,email,id,birthday,hometown&access_token='+token}, function (err, res_get, body) {
			if(err) {
				reject("Errore di richiesta dati");
			} else {
				var info= JSON.parse(body);
				resolve(info);
			}
		});
	});
}

function cercaItinerari(origin, destination, departureDate) {
	/*return amadeus.shopping.flightOffersSearch.get({
			originLocationCode: origin,
			destinationLocationCode: destination,
			departureDate: departureDate,
			adults: '1'
		});
	*/
	//TESTING MODE:
	
	var data = JSON.parse(fs.readFileSync('test_cerca_itinerari.json'));
	return new Promise(function(resolve,reject) {
		if(data.length > 0)
			resolve({"data": data});
		else
			reject("NONONO");
	});
}

function coronaTracker(countries){
	return new Promise(function(resolve, reject){
		request.get({url:"http://api.coronatracker.com/v3/stats/worldometer/country"}, function(err0, res1, body0) {
			if(err0) {
				reject("Errore di richiesta dati");
			}
			else {
				request.get({url:"http://api.coronatracker.com/v1/travel-alert"}, function(err1, res1, body1) {
				if(err1)
					reject("Errore di richiesta dati");
				else {
					resolve(JSON.parse(body0).filter(x=>countries.includes(x.countryName.toUpperCase())).map(function(x) {
						let obj = {
								"countryCode": x.countryCode,
								"country": x.country,
								"countryName": x.countryName,
								"activeCases": x.activeCases,
								"lastUpdated": x.lastUpdated,
								"alertMessage": JSON.parse(body1).find(y=>y.countryCode==x.countryCode).alertMessage
							}
							console.log(JSON.parse(body1).find(y=>y.countryCode==x.countryCode));
							return obj;
						}));
					}
				});
			}
		});
	});
}

const httpServer = https.createServer(options, app);

//Inizio WEBSOCKET
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

function sendAll (message) {
	for (var i=0; i<CLIENTS.length; i++) {
		var j=i+1;
		CLIENTS[i].send("Messaggio per il client "+j+": "+message);
	}
}

//Fine WEBSOCKET

httpServer.listen(port, function() { 
    console.log(`In ascolto sulla porta ${port}`);
});

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
				resolve(obj);
			} else if(res.statusCode == 409) {//Elemento già presente
				console.log(error);
				reject("Elemento già presente");
				updateCRUD(db,obj);
			}
			else {
				console.log(error);
				reject("Errore, codice: "+res.statusCode);
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
			if(error) reject(error);
			else if(res.statusCode != 200) reject(JSON.parse(body).error)
			else{
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
				if(error) {reject(error);}
				else if(res.statusCode!=201) {reject(res.statusCode);}
				else {
					resolve(true);
				}
			});
		}).catch(function(err){
			reject(err);
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
				if(error) {reject(error);}
				else if(res.statusCode!=200){reject(res.statusCode);}
				else {
					resolve(true);
				}
			});
		}).catch(function(err) {
			reject(err);
		});
	});
}

// SEZIONE --- API TERZE
app.get("/api",function(req,res){
	res.sendFile("./public/api.html",{root:__dirname});
});

//Itinerari, per casi
app.get("/api/tuttiItinerari",function(req,res){
	console.log(req.query);
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

function tuttiItinerari(){
	return new Promise(function(resolve, reject){
		readCRUD(itinerariesdb, {"id": "_all_docs?include_docs=true"}).then(function(res_readi) {
			let tosend = {"itineraries": []};
			for(let i = 0; i < res_readi.total_rows; i++) {
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
			resolve(tosend);
		}).catch(function(err_readi) {
			let tosend = {"error":"Errore nel caricamento delle mete!"};
			reject(tosend);
		});
	});
}

//Destinazioni più scelte con dati covid relativi alla meta finale
app.get("/api/preferiteCovid",function(req,res){
	tuttiItinerari().then(function(body){
		let maxUserN = Math.max(...body.itineraries.map(el => el.userN));
		let mostSearched = body.itineraries.filter(elem => elem.userN == maxUserN);
		let countriesOnly = mostSearched.map(el => GADB.find(x => x.IATA == el.destination).country);

		coronaTracker(countriesOnly).then(function(res0){
			let final = [];
			for(let i = 0; i < mostSearched.length; i++) {

				let destinationOnly = res0.find(x => x.countryName.toUpperCase() == GADB.find(y => y.IATA == mostSearched[i].destination).country);
				final.push(
					{
						"id": mostSearched[i].id,
						"origin": mostSearched[i].origin,
						"destination": mostSearched[i].destination,
						"departureDate": mostSearched[i].departureDate,
						"price": mostSearched[i].price,
						"currency": mostSearched[i].currency,
						"duration": mostSearched[i].duration,
						"lastTicketingDate": mostSearched[i].lastTicketingDate,
						"userN": mostSearched[i].userN,
						"activeCases": destinationOnly.activeCases,
						"lastUpdated": destinationOnly.lastUpdated,
						"alertMessage": destinationOnly.alertMessage
				}
			);
		}
		let toSend = {"itineraries":final};
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

//Destinazione in ordine crescente di contagi
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

app.get("/api/datiCovidPaesi", function(req,res) {
	coronaTracker(req.query.countries).then(function(res1){
		res.send({"data": res1});
	}).catch(function(err){
		console.log(err);
		res.send({"error": "Errore nel caricamento dei dati covid!"});
	});
});