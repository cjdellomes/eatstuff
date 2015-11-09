var mongoose = require('mongoose');
var userSchema = require('./userSchema.js');
var Schema = mongoose.Schema;


var waitQueue = Schema({
  user: [userSchema]
});


var Wait = mongoose.model('Wait', waitQueue);
var wait = new Wait();
var eat = new Wait();

exports.wait = wait;
exports.eat = eat;

