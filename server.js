var url = process.env.MONGOLAB_URI;
var client_id = process.env.IMGUR_CLIENT_ID;

var mongo = require('mongodb').MongoClient;
var path = require("path");
var util = require("util");
var request  = require("request");
var express = require("express");
var app = express();
var port = process.env.PORT || 8080;
var imgur_search_url = "https://api.imgur.com/3/gallery/search/viral/all/%s?q=";
var pug = require("pug");
var col = "imageAbstractionLayer";

module.exports = app;

app.listen(port, function(){
    console.log("listening on port %s", port);
})

app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'templates'));


app.get("/api/recent", function(req, res){
    mongo.connect(url, function(err, db){

        if (err){
            console.error(err);
            res.send(err);
        } else{
            collection = db.collection(col);
            collection.find().project({
                timestamp:1,
                term:1,
                _id:0
            }).sort({
                timestamp: -1
            }).limit(20).toArray( 
                function(err, docs){
                    res.send(docs);
                    db.close();
                })
        }
    })

})

app.get("/api/imagesearch/:keyphrase", function(req, res){
    keyphrase = req.params.keyphrase;
    offset = req.query.offset | 1;
    var options = {
        url: util.format(imgur_search_url, offset.toString()) + keyphrase,
        headers: {
            authorization:  "CLIENT-ID " +  client_id

        }
    };
    request.get(options, function(err, res2, body){
        if (err) res.send(err);
        else {
            parsed = JSON.parse(body);
            ret = [];
            if (parsed.data.length>0){
                parsed.data.forEach(function(result, index){
                    r = {url: result.link,
                        alt: result.title,
                        page_url: "https://i.imgur.com/" + result.id
                    }
                    ret.push(r);
                    if (ret.length == parsed.data.length){
                        res.json(ret);
                    }
                })
            }
            else{
                res.send("no data");
            }
        }
    })
    mongo.connect(url, function(err, db){

        collection = db.collection(col);
        collection.insert(
                {timestamp: new Date(),
                    term: keyphrase
                }, 
                function(data){
                    db.close();
                })
    })
})


app.get("/api/imagesearch/", function(req, res){
    res.send("Yo! Give me a key phrase");

})

app.get("/", function(req, res){
        res.render("index.pug");
})
