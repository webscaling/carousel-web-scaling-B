const mongoose = require('mongoose');
const { uri } = require('./config.js');

mongoose.connect(uri, { useNewUrlParser: true });

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function () {
  console.log('we\'re connected!');
});

const schema = new mongoose.Schema({
  ProductId: Number,
  ItemName: String,
  Price: Number,
  Rating: Number,
  RatingCount: Number,
  Category: String,
  Photo: String
});

const carouselItem = mongoose.model('carousel-items', schema);

module.exports = { carouselItem };