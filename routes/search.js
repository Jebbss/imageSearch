'use strict';
module.exports = function(app, db) {

  app.post('/search', function(req, res) {
    //use request module for HTTP requests
    var request = require('request');
    var numResults = req.body.numResults;
    var queryString = req.body.query;
    var queryObj = {};
    var dt = new Date();
    var url = "";
    queryObj = {
      "Query": queryString,
      "Time": dt,
      "numToShow": numResults
    };
    db.collection("data").insert(queryObj, function(err, data) {
        if (err) {console.log("Insert db err: " + err);}
    });
    url = 'https://www.googleapis.com/customsearch/v1' + '?key=' + process.env.GOOGLE_KEY + '&cx=' + process.env.GOOGLE_CE + '&searchType=image' + '&q=' + queryString + '&start=' + numResults;
    var requestObject = {
      uri: url,
      method: 'GET',
      timeout: 10000
    };

    request(requestObject, function(error, response, body) {

      if (error) {
        throw (error);
      } else {
        //array to hold the search result objects
        var array = [];
        //parse the body as JSON
        var result = JSON.parse(body);
        //only use the items of the body, that is an array of search results objects
        var imageList = result.items;
        for (var i = 0; i < imageList.length; i++) {
          var image = {
            "url": imageList[i].link,
            "snippet": imageList[i].snippet,
            "thumbnail": imageList[i].image.thumbnailLink,
            "context": imageList[i].displayLink
          };
          array.push(image);
        }
        res.send(array);
      }
    });
  });

  app.post('/recent', function(req, res) {
    let recentDate = null;
    var docs = db.collection("data").find().toArray(function(err, docs) {
      if (Object.keys(docs).length > 0) {
        if (Object.keys(docs).length > 10) {
          var arrLen = Object.keys(docs).length;
          docs = docs.slice((arrLen-11),arrLen);
          console.log("slicing");
        }
        res.send(docs);
      }
      else {
        res.send("oops")
      }
    });
    if (recentDate) {
      db.collection("data").remove( { Time: { $lt: recentDate } } )
      console.log("Truncating db");
    }
  });

};
