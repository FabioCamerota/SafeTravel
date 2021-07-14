/*
 * Basic Example
 *
 * This is a basic example for apiDoc.
 * Documentation blocks without @api (like this block) will be ignored.
 */

/**
 * @api {get} /datiCovidPaesi/:destination Itinerari con dati covid dei Paesi di destinazione inseriti
 * @apiName GetDatiCovid
 * @apiGroup Dati Covid
 *
 * @apiParam {String} destination Nome del Paese di destinazione.
 * @apiParam {String} [destination2] Nome di un ulteriore Paese di destinazione.
 *
 * @apiSuccess {Array} data Array di dati Covid.
 * @apiSuccess {String} countryCode  Codice univoco del Paese di destinazione inserito.
 * @apiSuccess {String} countryName  Nome del Paese di destinazione inserito.
 * @apiSuccess {Int} activeCases  Numero di casi covid attivi nel paese di destinazione.
 * @apiSuccess {String} lastUpdated  Data aggiornamento dati Covid.
 * @apiSuccess {String} alertMessage  Messaggio con informazioni riguardo le regole Covid per i passeggeri.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": [
 *             {
 *             "countryCode": "TH",
 *             "countryName": "Thailand",
 *             "activeCases": 99511,
 *             "lastUpdated": "2021-07-14T18:24:00.000Z",
 *             "alertMessage": "\nFlights to Thailand are suspended.|\n- This does not apply to state or military aircraft, emergency landing, technical landing without disembarkation, humanitarian aid, medical, relief and repatriation flights. Passengers are subject to quarantine for 14 days upon arrival.|\n"
 *             },
 *             {
 *             "countryCode": "NC",
 *             "countryName": "New Caledonia",
 *             "activeCases": 71,
 *             "lastUpdated": "2021-07-14T18:24:00.000Z",
 *             "alertMessage": "\nFlights to New Caledonia are suspended until 31 May 2020.|\n"
 *             }
 *        ]
 *      }
 *
 * @apiError BadRequest Errore, inserire almeno un paese!.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
         "error": "Errore, inserire almeno un paese!"
       }
 */

/**
 * @api {get} /tuttiItinerari Informazioni su tutti gli itinerari
 * @apiName GetItinerari
 * @apiGroup Itinerari
 *
 * @apiParam {String} [origin] Nome della città di partenza.
 * @apiParam {String} [destination] Nome della città di destinazione.
 *
 * @apiSuccess {Array} itineraries Array di itenerari.
 * @apiSuccess {String} id  Id univoco dell'itinerario.
 * @apiSuccess {String} origin  Nome della città di partenza.
 * @apiSuccess {String} destination  Nome della città di destinazione.
 * @apiSuccess {String} departureDate  Data di partenza.
 * @apiSuccess {String} price  Prezzo.
 * @apiSuccess {String} currency  Valuta.
 * @apiSuccess {String} duration  Durata del viaggio.
 * @apiSuccess {String} lastTicketingDate Ultima data di emissione del biglietto.
 * @apiSuccess {Int} userN  Numero di volte che l'itinerario è stato salvato tra i preferiti.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "itineraries": [
                     {
                     "id": "BKK_AAR_2021-08-01_479.11_EUR_PT18H35M_2021-08-01",
                     "origin": "BKK",
                     "destination": "AAR",
                     "departureDate": "2021-08-01",
                     "price": "479.11",
                     "currency": "EUR",
                     "duration": "PT18H35M",
                     "lastTicketingDate": "2021-08-01",
                     "userN": 1
                     },
                     {
                     "id": "BKK_AAR_2021-08-01_661.80_EUR_PT16H10M_2021-06-30",
                     "origin": "BKK",
                     "destination": "AAR",
                     "departureDate": "2021-08-01",
                     "price": "661.80",
                     "currency": "EUR",
                     "duration": "PT16H10M",
                     "lastTicketingDate": "2021-06-30",
                     "userN": 1
                     },
              ]
        }
 *
 * @apiError ItineraryNotFound L'itinerario non è stato trovato
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "ItineraryNotFound"
 *     }
 */

/**
 * @api {get} /itinerariDatiCovid Numero dei contagi in ordine crescente nelle destinazioni più popolari
 * @apiName Get Itinerari con dati Covid sulle destinazioni più popolari
 * @apiGroup Dati Covid
 *
 * @apiSuccess {Array} itineraries Array di itenerari.
 * @apiSuccess {String} id  Id univoco dell'itinerario.
 * @apiSuccess {String} origin  Nome della città di partenza.
 * @apiSuccess {String} destination  Nome della città di destinazione.
 * @apiSuccess {String} departureDate  Data di partenza.
 * @apiSuccess {String} price  Prezzo.
 * @apiSuccess {String} currency  Valuta.
 * @apiSuccess {String} duration  Durata del viaggio.
 * @apiSuccess {String} lastTicketingDate Ultima data di emissione del biglietto.
 * @apiSuccess {Int} userN  Numero di volte che l'itinerario è stato salvato tra i preferiti.
 * @apiSuccess {Int} activeCases  Numero di casi covid attivi nel paese di destinazione.
 * @apiSuccess {String} lastUpdated  Data aggiornamento dati Covid.
 * @apiSuccess {String} alertMessage  Messaggio con informazioni riguardo le regole Covid per i passeggeri.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
              "itineraries": [
                     {
                     "id": "BKK_AAR_2021-08-01_661.80_EUR_PT16H10M_2021-06-30",
                     "origin": "BKK",
                     "destination": "AAR",
                     "departureDate": "2021-08-01",
                     "price": "661.80",
                     "currency": "EUR",
                     "duration": "PT16H10M",
                     "lastTicketingDate": "2021-06-30",
                     "userN": 1,
                     "activeCases": 8549,
                     "lastUpdated": "2021-07-14T17:56:00.000Z",
                     "alertMessage": "\n1. Passengers are not allowed to enter Denmark.|\n-This does not apply to:|\n- nationals and residents of Denmark.|\n- passengers traveling to visit a critically or terminal ill family member; to participate in a funeral or if already in an ongoing health treatment or when called for a court case;|\n- legal guardian of a minor or traveling to exercise visitation rights to a minor.|\n- passengers with documentation to prove employment in Denmark;|\n- passengers with documentation to prove that parked at Copenhagen Airport (CPH) is the vehicle needed for their ongoing journey out of Denmark (e.g., to Sweden).|\n"
                     }
              ]
       }
 *
 *
 * @apiError ItineraryNotFound Errore nel caricamento delle mete più gettonate!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
         "error": "Errore nel caricamento delle mete più gettonate!"
       }
 */