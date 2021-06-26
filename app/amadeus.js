require('dotenv').config();

var Amadeus = require('amadeus');

var amadeus = new Amadeus({
  clientId: process.env.AMADEUS_KEY,
  clientSecret: process.env.AMADEUS_SECRET
});
/*
amadeus.shopping.flightOffersSearch.get({
    originLocationCode: 'SYD',
    destinationLocationCode: 'BKK',
    departureDate: '2021-08-01',
    adults: '2'
}).then(function(response){
  console.log(response.data);
}).catch(function(responseError){
  console.log(responseError.code);
});
*/
/*
amadeus.client.get('/v2/reference-data/urls/checkin-links', { airlineCode: 'BA' }).then(function(response){
    console.log(response.data);
}).catch(function(responseError){
    console.log(responseError.code);
});
*/


amadeus.shopping.flightOffersSearch.get({
    originLocationCode: 'BKK',
    destinationLocationCode: 'SYD',
    departureDate: '2021-08-01',
    adults: '2'
}).then(function(response){
    console.log(response.data);
}).catch(function(responseError){
    console.log(responseError.code);
});


/*
amadeus.referenceData.urls.checkinLinks.get({
    airlineCode : 'MAD'
}).then(function(response){
    console.log(response.data);
}).catch(function(responseError){
    console.log(responseError);
});
*/

amadeus.referenceData.airlines.get({
    airlineCodes : 'GKA'
}).then(function(response){
    console.log(response.data);
}).catch(function(responseError){
    console.log(responseError);
});


/*
amadeus.shopping.flightDestinations.get({origin : 'BKK'}).then(function(response){
    console.log(response.data);
}).catch(function(responseError){
    console.log(responseError.code);
});
*/