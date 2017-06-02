module.exports = function (app) {

    var mongoose = require('mongoose');
    var bar = require('../models/barmodel.js');
    var Bar = mongoose.model('Bar');

    var Yelp = require('yelpv3');

    var yelp = new Yelp({
        app_id: process.env.APP_ID_YELP,
        app_secret: process.env.APP_SECRET_YELP
    });

    /*
    This query is used to save bars to the database.
    */

    var addBars = function (currentBar) {
        var name = currentBar.name;

        Bar.findOne({ "name": name }, 'users going',
            function (err, bar) {
                if (bar) {
                    console.log("bar exists");
                }
                else {
                    var bar = new Bar();
                    bar.name = name;
                    bar.rating = currentBar.rating;
                    bar.price = currentBar.price;
                    bar.id = currentBar.id;
                    bar.location.address1 = currentBar.location.address1;
                    bar.location.address2 = currentBar.location.address2;
                    bar.location.city = currentBar.location.city;
                    bar.location.state = currentBar.location.state;
                    bar.location.zip_code = currentBar.location.zip_code;
                    bar.image_url = currentBar.image_url;
                    bar.users = [];
                    bar.going = 0;
                    bar.save();

                }
            });
    }

    function returnJSON(req, res, next) {   // indicates that response expected is JSON
        res.header("Content-Type", "application/json");
        next();
    }

    /*
        This is the route to return results from the Yelp API for 
        users authenticated through Facebook.  The bars searched for
        by this route are saved to the database.
    */


    app.post('/bars/search', returnJSON, function (req, res) {  //authenticated search of bars
        var seeker = req.body.seeker;
        yelp.search({ term: 'bars', location: req.body.location, limit: 12 })
            .then(function (data) {

                var results = JSON.parse(data);
                var businesses = results["businesses"];
                var myBarsResults = [];  //create an array of bar results objects from yelp;
                for (var j = 0; j < businesses.length; j++) {
                    addBars(businesses[j]);
                    myBarsResults.push(businesses[j]);
                }
                var query = Bar.find({ "users": seeker });  
                /*

                The strategy here is to find all of the individual bars in the Bar model
                where the "users" array contains the "seeker", which is the logged in FB Display Name.
                The way this query is currently structured, only bars that have this user listed in the
                "users" array will contain the "user" array property in the "bar" object
                returned to the scope.

                */


                // A query is not a fully-fledged promise, but it does have a `.then()`.
                query.then(function (doc) {  
                    // use doc
                    if (doc.length < 1){
                        res.send(myBarsResults);
                    }
                    for(var i = 0; i < myBarsResults.length; i++){
                        for(var j =0; j < doc.length; j++){
                            if(myBarsResults[i]["name"] === doc[j]["name"]){
                                myBarsResults[i]["users"] = doc[j]["users"];
                                console.log(myBarsResults[i]);
                            }
                        }
                        if(i >=  myBarsResults.length - 1){
                            res.send(myBarsResults);
                        }
                    }                    
                });

            })
            .catch(function (err) {
                console.error(err);
            });
    });

    /*
        This is the route to return results from the Yelp API for 
        non-authenticated users.  The bars searched for
        by this route are not saved to the database.
    */

    app.post('/bars/search/nonauth', returnJSON, function (req, res) {   
        yelp.search({ term: 'bars', location: req.body.location, limit: 12 })
            .then(function (data) {
                res.send(data);
            })
            .catch(function (err) {
                console.error(err);
            });
    });


};