var request = require('request');
const fs = require('fs');


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
console.log(GADB);

for(let i = 0; i < 10; i++) {
  var options = {
    'method': 'GET',
    'url': 'http://api.coronatracker.com/v3/stats/worldometer/country',
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(JSON.parse(response.body).filter(v=>v.country.toUpperCase()==GADB[i].country));
  });
}