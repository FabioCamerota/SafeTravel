require('dotenv').config();

var Amadeus = require('amadeus');

var amadeus = new Amadeus({
  clientId: process.env.AMADEUS_KEY,
  clientSecret: process.env.AMADEUS_SECRET
});


/*
amadeus.client.get('/v2/reference-data/urls/checkin-links', { airlineCode: 'BA' }).then(function(response){
    console.log(response.data);
}).catch(function(responseError){
    console.log(responseError.code);
});
*/

/*
amadeus.shopping.flightOffersSearch.get({
    originLocationCode: 'BKK',
    destinationLocationCode: 'AAR',
    departureDate: '2021-08-01',
    adults: '1'
}).then(function(response){
    console.log(response.data);
    console.log(response.data.map(v=>v.itineraries.length));
}).catch(function(responseError){
    console.log(responseError.code);
});
*/


amadeus.referenceData.urls.checkinLinks.get({
    airlineCode : 'QR'
}).then(function(response){
    console.log(response.data);
}).catch(function(responseError){
    console.log(responseError);
});


amadeus.referenceData.airlines.get({
    airlineCodes : 'QR'
}).then(function(response){
    console.log(response.data);
}).catch(function(responseError){
    console.log(responseError);
});


/*
amadeus.shopping.flightDestinations.get({origin : 'SYD'}).then(function(response){
    console.log(response.data);
}).catch(function(responseError){
    console.log(responseError.code);
});
*/