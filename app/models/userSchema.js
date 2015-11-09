var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id: Number,
  name: String,
  partySize: Number,
  email: String,
  intentUrl: String
});

