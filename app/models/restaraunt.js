var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var restaurantData = Schema({
  name: String,
  waitTime: String,
  dataUrl: String
});

var Restaurant = mongoose.model('Restaurant', restaurantData);

var eatery = new Restaurant({
  name: 'Doge Cafe',
  waitTime: 'Much Wait',
  // TODO: find out the full path that will be used
  dataUrl: 'https://eatstuff.ngrok.com/api/form'
});

module.exports = eatery;
