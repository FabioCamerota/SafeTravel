define({ "api": [
  {
    "type": "get",
    "url": "/datiCovidPaesi/:countries",
    "title": "Itinerari con dati covid dei Paesi di destinazione inseriti",
    "name": "GetDatiCovid",
    "group": "Dati_Covid",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "countries[0]",
            "description": "<p>Nome del Paese di destinazione.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "countries[1]",
            "description": "<p>Nome di un ulteriore Paese di destinazione.</p>"
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
            "field": "data",
            "description": "<p>Array di dati Covid.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "countryCode",
            "description": "<p>Codice univoco del Paese di destinazione inserito.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "countryName",
            "description": "<p>Nome del Paese di destinazione inserito.</p>"
          },
          {
            "group": "Success 200",
            "type": "Int",
            "optional": false,
            "field": "activeCases",
            "description": "<p>Numero di casi covid attivi nel paese di destinazione.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastUpdated",
            "description": "<p>Data aggiornamento dati Covid.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "alertMessage",
            "description": "<p>Messaggio con informazioni riguardo le regole Covid per i passeggeri.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"data\": [\n        {\n        \"countryCode\": \"TH\",\n        \"countryName\": \"Thailand\",\n        \"activeCases\": 99511,\n        \"lastUpdated\": \"2021-07-14T18:24:00.000Z\",\n        \"alertMessage\": \"\\nFlights to Thailand are suspended.|\\n- This does not apply to state or military aircraft, emergency landing, technical landing without disembarkation, humanitarian aid, medical, relief and repatriation flights. Passengers are subject to quarantine for 14 days upon arrival.|\\n\"\n        },\n        {\n        \"countryCode\": \"NC\",\n        \"countryName\": \"New Caledonia\",\n        \"activeCases\": 71,\n        \"lastUpdated\": \"2021-07-14T18:24:00.000Z\",\n        \"alertMessage\": \"\\nFlights to New Caledonia are suspended until 31 May 2020.|\\n\"\n        }\n   ]\n }",
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
            "field": "BadRequest",
            "description": "<p>Errore, inserire almeno un paese!.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n     \"error\": \"Errore, inserire almeno un paese!\"\n   }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "public/creatiDaMe/example.js",
    "groupTitle": "Dati_Covid",
    "sampleRequest": [
      {
        "url": "https://localhost:3000/api/datiCovidPaesi/:countries"
      }
    ]
  },
  {
    "type": "get",
    "url": "/itinerariDatiCovid",
    "title": "Numero dei contagi in ordine crescente nelle destinazioni più popolari",
    "name": "Get_Itinerari_con_dati_Covid_sulle_destinazioni_più_popolari",
    "group": "Dati_Covid",
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
          },
          {
            "group": "Success 200",
            "type": "Int",
            "optional": false,
            "field": "activeCases",
            "description": "<p>Numero di casi covid attivi nel paese di destinazione.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastUpdated",
            "description": "<p>Data aggiornamento dati Covid.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "alertMessage",
            "description": "<p>Messaggio con informazioni riguardo le regole Covid per i passeggeri.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n          \"itineraries\": [\n                 {\n                 \"id\": \"BKK_AAR_2021-08-01_661.80_EUR_PT16H10M_2021-06-30\",\n                 \"origin\": \"BKK\",\n                 \"destination\": \"AAR\",\n                 \"departureDate\": \"2021-08-01\",\n                 \"price\": \"661.80\",\n                 \"currency\": \"EUR\",\n                 \"duration\": \"PT16H10M\",\n                 \"lastTicketingDate\": \"2021-06-30\",\n                 \"userN\": 1,\n                 \"activeCases\": 8549,\n                 \"lastUpdated\": \"2021-07-14T17:56:00.000Z\",\n                 \"alertMessage\": \"\\n1. Passengers are not allowed to enter Denmark.|\\n-This does not apply to:|\\n- nationals and residents of Denmark.|\\n- passengers traveling to visit a critically or terminal ill family member; to participate in a funeral or if already in an ongoing health treatment or when called for a court case;|\\n- legal guardian of a minor or traveling to exercise visitation rights to a minor.|\\n- passengers with documentation to prove employment in Denmark;|\\n- passengers with documentation to prove that parked at Copenhagen Airport (CPH) is the vehicle needed for their ongoing journey out of Denmark (e.g., to Sweden).|\\n\"\n                 }\n          ]\n   }",
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
            "description": "<p>Errore nel caricamento delle mete più gettonate!</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n     \"error\": \"Errore nel caricamento delle mete più gettonate!\"\n   }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "public/creatiDaMe/example.js",
    "groupTitle": "Dati_Covid",
    "sampleRequest": [
      {
        "url": "https://localhost:3000/api/itinerariDatiCovid"
      }
    ]
  },
  {
    "type": "get",
    "url": "/tuttiItinerari",
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
            "description": "<p>Codice della città di partenza.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "destination",
            "description": "<p>Codice della città di destinazione.</p>"
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
          "content": "HTTP/1.1 200 OK\n{\n    \"itineraries\": [\n                 {\n                 \"id\": \"BKK_AAR_2021-08-01_479.11_EUR_PT18H35M_2021-08-01\",\n                 \"origin\": \"BKK\",\n                 \"destination\": \"AAR\",\n                 \"departureDate\": \"2021-08-01\",\n                 \"price\": \"479.11\",\n                 \"currency\": \"EUR\",\n                 \"duration\": \"PT18H35M\",\n                 \"lastTicketingDate\": \"2021-08-01\",\n                 \"userN\": 1\n                 },\n                 {\n                 \"id\": \"BKK_AAR_2021-08-01_661.80_EUR_PT16H10M_2021-06-30\",\n                 \"origin\": \"BKK\",\n                 \"destination\": \"AAR\",\n                 \"departureDate\": \"2021-08-01\",\n                 \"price\": \"661.80\",\n                 \"currency\": \"EUR\",\n                 \"duration\": \"PT16H10M\",\n                 \"lastTicketingDate\": \"2021-06-30\",\n                 \"userN\": 1\n                 },\n          ]\n    }",
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
        "url": "https://localhost:3000/api/tuttiItinerari"
      }
    ]
  }
] });
