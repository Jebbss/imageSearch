var express = require('express');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var path = require('path');
var api = require('./routes/search.js');
var dotenv = require('dotenv');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
dotenv.config();

var urlDB = process.env.MONGODB_URI || 'mongodb://localhost:27017/data';
var dbName = "heroku_ncwrqwnt";

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, './public/index.html'));
// });

//connect to db
mongo.MongoClient.connect(urlDB, function (err, client) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error: ', err);
  } else {
    console.log('Connection established to ', urlDB);
  }
  var db = client.db(dbName);
  var port = process.env.PORT || 3500;

  app.listen(port, function(){
    console.log("Listening on port: " + port);
  });

  api(app, db);

});
