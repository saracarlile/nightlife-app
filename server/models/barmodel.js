var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
 
 
var BarSchema = new Schema({
    id: String,
    name: String,
    rating: String,
    price: String,
    image_url: String,
    location: {
        address1:{
            type: String
        }, 
        address2:{
            type: String
        },
        city:{
            type: String
        },
        state:{
            type: String
        },
        zip_code:{
            type: String
        }
    },
    going: Number, 
    users: []
});
 
mongoose.model('Bar', BarSchema);