/*
 * Basic Example
 *
 * This is a basic example for apiDoc.
 * Documentation blocks without @api (like this block) will be ignored.
 */

/**
 * @api {get} /datiCovidPaesi/ Get dati Covid dei Paesi
 * @apiName GetDatiCovid
 * @apiGroup Dati Covid
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 *
 * @apiError UserNotFound The <code>id</code> of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */

/**
 * @api {get} /tuttiItinerari/ Informazioni su tutti gli itinerari
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
 * @api {get} /itinerariDatiCovid/ Numero dei contagi nella destinazione in ordine crescente
 * @apiName Get Itinerari con dati Covid sulla destinazione
 * @apiGroup Dati Covid
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 *
 * @apiError UserNotFound The <code>id</code> of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */