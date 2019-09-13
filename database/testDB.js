const { carouselItem } = require('../database/mongoose.js');
const mongoose = require('mongoose');
var faker = require('faker');
const timerFn = require('timer-node');
const timer = timerFn('test-timer');

const createItemArray = (max) => {

  let itemArray = [];
  for(let i = 0; i < max; i++){
      let item = new carouselItem({
        ProductId: i,
        ItemName: faker.commerce.productName(),
        Price: Number((Math.random() * 1000).toFixed(2)),
        Rating: Math.floor((Math.random() * 5) + 1),
        RatingCount: Math.floor((Math.random() * 20000) + 1),
        Category: faker.commerce.department(),
        Photo: 'http://lorempixel.com/150/150/technics/'
      })
      let bulkLoad = {insertOne: item};
      itemArray.push(bulkLoad);
  }
  return itemArray;
}

const mongooseDBSeed = (max) => {

  timer.start();

  let itemArray = createItemArray(max);

  timer.stop();
  console.log(`Array loaded in ${timer.seconds()} seconds.`)
  timer.start();

  carouselItem.collection.bulkWrite(itemArray)
  .then((res)=> {
    timer.stop();
    console.log(`${res.insertedCount} items inserted in ${timer.seconds()} seconds.`)
  })
}

const mongoDBSeed = (max) => {
  
}

module.exports = { mongooseDBSeed };