const { carouselItem } = require('../database/mongoose.js');
const mongoose = require('mongoose');
var faker = require('faker');
const timerFn = require('timer-node');

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
  const timer = timerFn('test-timer');
  timer.start();
  let n = max //number of items per seed
  let seedsPerRound = 100000;
  let rounds = max / 100000; //number of rounds of seeding
  console.log(`Beginning seed with ${rounds} rounds`)

  console.log('seeds left: ', rounds);
  rounds--;
  mongooseSeeder(seedsPerRound);
  let interval = setInterval(() => {
    if (rounds === 0){
      timer.stop();
      clearInterval(interval);
      console.log(`Database seed completed in ${timer.seconds()} seconds`);
    } else {
      console.log('seeds left: ', rounds);
      mongooseSeeder(seedsPerRound);
      rounds--;
    }
  }, 12000);
}

const mongooseSeeder = (max) => {
  const timer2 = timerFn('test-timer');
  timer2.start();

  let itemArray = createItemArray(max);

  timer2.stop();
  console.log(`Array loaded in ${timer2.seconds()} seconds.`)
  timer2.start();

  carouselItem.collection.bulkWrite(itemArray)
  .then((res)=> {
    timer2.stop();
    console.log(`${res.insertedCount} items inserted in ${timer2.seconds()} seconds.`)
  })
}

const mongoDBSeed = (max) => {
  
}

module.exports = { mongooseDBSeed };