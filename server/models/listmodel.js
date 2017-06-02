var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ListSchema = new Schema({
    list: Array,
    location: String,
    query: String
});

mongoose.model('List', ListSchema);