// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bp=require("body-parser");
var request=require("request");
var mongo=require("mongodb").MongoClient
var url=process.env.SECRET

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});




// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/query", function (req, res) {
   var link="https://www.googleapis.com/customsearch/v1?key="+process.env.API+"&cx="+process.env.id+"&q="+req.body.search;
  request(link, function(err, response, body){
    var searchResult=JSON.parse(body)["items"];
    res.send(searchResult);
    
  });

  
  
});

app.get("/new/:search", function(req,res){
  
  var page=req.query['offset'];
  var link="https://www.googleapis.com/customsearch/v1?key="+process.env.API+"&cx="+process.env.id+"&q="+req.params.search+"&start="+((page*10)-9);
  if (!page){
    link="https://www.googleapis.com/customsearch/v1?key="+process.env.API+"&cx="+process.env.id+"&q="+req.params.search;
  }
  request(link, function(err, response, body){
    var searchResult=JSON.parse(body)["items"];
    res.send(searchResult);
    
  });
  storeInDb(req.params.search);
  
})

function storeInDb(searchString){
  var doc={
    search:null
  }
  
  doc.search=searchString;
  mongo.connect(url, function(err, db){
    if (err) throw err;
    var collection=db.collection("searches");
    collection.insert(doc);
    console.log("Document Inserted")
  
  });
}
app.use("/latest", function(req,res){
  mongo.connect(url, function(err, db){
    db.collection("searches").find({}).limit(50).toArray(function(err,docs){
      res.send(docs)
    });

  })
})


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
