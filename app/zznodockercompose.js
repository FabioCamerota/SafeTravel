const fs = require("fs");

var lines = fs.readFileSync("server.js").toString().split("\n");


for(let i = 0; i < lines.length; i++) {
    if(lines[i].includes(`http://admin:admin@couchdb:5984`)) {
        console.log(lines[i].replace("couchdb","localhost"));
    }
    else
        console.log(lines[i]);
}
