module.exports = function (app) {

    var mongoose = require('mongoose');
    var user = require('../models/usermodel.js');
    var bar = require('../models/barmodel.js');
    var User = mongoose.model('User');
    var Bar = mongoose.model('Bar');

    
    app.post('/saveuser', function (req, res) { // route to save current user from FB login
        var user_name = req.body.user;
        User.findOne({ 'facebook.name': user_name }, function (err, user) {
            if (user) {
                console.log("user exists");
            } else {
                var user = new User();
                user.facebook.name = user_name;
                user.save();
            }
        });
        res.send("ok");
    });



    app.post('/join', function (req, res) {
        var username = req.body.user;
        var thisBar = req.body.barname;  
        Bar.find({ "name": thisBar }, { 'users': username })
            .exec(function (err, bar) {
                if (bar) {
                    console.log("bar exists add going!");
                    console.log(bar);
                    console.log(bar[0]);
                    console.log(bar[0]["users"]);
                    if (bar[0]["users"].indexOf(username) < 0 ) { //if user is not added to bar 
                        Bar.findOneAndUpdate({"name": thisBar}, {$push: {"users": username}}, {new: true}, function (err, bar) {  // user was added to bar list
                            if (err) {
                                console.log('error adding bar to user')
                            }
                            else {
                                res.send(bar);
                                console.log("user was added to bar");
                            }
                        });
                    }
                    else {
                        Bar.findOneAndUpdate({"name": thisBar }, {$pull: {"users": username}}, { new: true }, function (err, bar) {  // user was removed from bar list
                            if (err) {
                                console.log('error')
                            }
                            else {
                                res.send(bar);
                                console.log("user was removed from bar!");
                            }
                        });
                    }
                }
                else {
                    console.log('query failed!')
                }
            });
        
    });


};
