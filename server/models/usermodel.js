 
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
 
var UserSchema = new Schema({
    facebook: {
        name:{
            type: String
        }
    }, 
    bars: []  
});


 
mongoose.model('User', UserSchema);