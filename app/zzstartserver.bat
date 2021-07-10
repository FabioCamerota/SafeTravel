::npm init
::npm install https --save-prod
::PUT http://admin:admin@127.0.0.1:5984/users

::docker-compose build
::docker-compose up
::docker-compose down

docker-compose build
docker-compose up -d
docker-compose logs -f nodeserver