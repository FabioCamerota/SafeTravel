define({ "api": [
  {
    "type": "get",
    "url": "/datiCovidPaesi/",
    "title": "Get dati Covid dei Paesi",
    "name": "GetDatiCovid",
    "group": "Dati_Covid",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Users unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "firstname",
            "description": "<p>Firstname of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastname",
            "description": "<p>Lastname of the User.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"firstname\": \"John\",\n  \"lastname\": \"Doe\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "UserNotFound",
            "description": "<p>The <code>id</code> of the User was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": \"UserNotFound\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "public/creatiDaMe/example.js",
    "groupTitle": "Dati_Covid",
    "sampleRequest": [
      {
        "url": "https://localhost:3000/api/datiCovidPaesi/"
      }
    ]
  },
  {
    "type": "get",
    "url": "/itinerariDatiCovid/",
    "title": "Numero dei contagi nella destinazione in ordine crescente",
    "name": "Get_Itinerari_con_dati_Covid_sulla_destinazione",
    "group": "Dati_Covid",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Users unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "firstname",
            "description": "<p>Firstname of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastname",
            "description": "<p>Lastname of the User.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"firstname\": \"John\",\n  \"lastname\": \"Doe\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "UserNotFound",
            "description": "<p>The <code>id</code> of the User was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": \"UserNotFound\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "public/creatiDaMe/example.js",
    "groupTitle": "Dati_Covid",
    "sampleRequest": [
      {
        "url": "https://localhost:3000/api/itinerariDatiCovid/"
      }
    ]
  },
  {
    "type": "get",
    "url": "/tuttiItinerari/",
    "title": "Informazioni su tutti gli itinerari",
    "name": "GetItinerari",
    "group": "Itinerari",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "origin",
            "description": "<p>Nome della città di partenza.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "destination",
            "description": "<p>Nome della città di destinazione.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "itineraries",
            "description": "<p>Array di itenerari.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Id univoco dell'itinerario.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "origin",
            "description": "<p>Nome della città di partenza.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "destination",
            "description": "<p>Nome della città di destinazione.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "departureDate",
            "description": "<p>Data di partenza.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "price",
            "description": "<p>Prezzo.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "currency",
            "description": "<p>Valuta.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "duration",
            "description": "<p>Durata del viaggio.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastTicketingDate",
            "description": "<p>Ultima data di emissione del biglietto.</p>"
          },
          {
            "group": "Success 200",
            "type": "Int",
            "optional": false,
            "field": "userN",
            "description": "<p>Numero di volte che l'itinerario è stato salvato tra i preferiti.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"itineraries\": [\n                        {\n\n                        \"id\": \"BKK_AAR_2021-08-01_479.11_EUR_PT18H35M_2021-08-01\",\n                        \"origin\": \"BKK\",\n                        \"destination\": \"AAR\",\n                        \"departureDate\": \"2021-08-01\",\n                        \"price\": \"479.11\",\n                        \"currency\": \"EUR\",\n                        \"duration\": \"PT18H35M\",\n                        \"lastTicketingDate\": \"2021-08-01\",\n                        \"userN\": 1\n                        },\n                        {\n                        \"id\": \"BKK_AAR_2021-08-01_661.80_EUR_PT16H10M_2021-06-30\",\n                        \"origin\": \"BKK\",\n                        \"destination\": \"AAR\",\n                        \"departureDate\": \"2021-08-01\",\n                        \"price\": \"661.80\",\n                        \"currency\": \"EUR\",\n                        \"duration\": \"PT16H10M\",\n                        \"lastTicketingDate\": \"2021-06-30\",\n                        \"userN\": 1\n                        },\n                    ]\n    }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "ItineraryNotFound",
            "description": "<p>L'itinerario non è stato trovato</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": \"ItineraryNotFound\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "public/creatiDaMe/example.js",
    "groupTitle": "Itinerari",
    "sampleRequest": [
      {
        "url": "https://localhost:3000/api/tuttiItinerari/"
      }
    ]
  }
] });
