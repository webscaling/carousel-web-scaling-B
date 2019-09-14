const { carouselItem } = require('../database/mongoose.js');
const mongoose = require('mongoose');
var faker = require('faker');
const timerFn = require('timer-node');

const createItemArray = (max, startId = 0) => {

  let itemArray = [];
  for(let i = 0; i < max; i++){
      let item = new carouselItem({
        ProductId: startId + i,
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

const mongooseDBSeed = (max = 100000, worker, maxWorkers) => {
  const timer = timerFn('test-timer');
  timer.start();
  let seedsPerRound = 50000;
  let rounds = max / seedsPerRound; //number of rounds of seeding
  let maxRounds = rounds;
  console.log(`Worker ${worker} is beginning to seed with ${rounds} rounds`)

  let interval = setInterval(() => {
    if (rounds === 0){
      timer.stop();
      clearInterval(interval);
      console.log(`Worker ${worker} has completed seeding in ${timer.seconds()} seconds`);
      if(worker === 8){
        timer.start();
        console.log(`Database is being indexed by worker ${worker}`);
        carouselItem.collection.createIndex({ProductId: 1}, (err, result) => {
          if(err) console.error(err);
          timer.stop();
          console.log(`Worker ${worker} has indexed the database in ${timer.seconds()} seconds`)
        })
      }
    } else {
      console.log(`Worker ${worker} is on round `, maxRounds + 1 - rounds,` of ${maxRounds}`);
      mongooseSeeder(seedsPerRound, worker, maxWorkers, seedsPerRound, maxRounds - rounds);
      rounds--;
    }
  }, 12000);
}

const mongooseSeeder = (max, worker, maxWorkers, seedsPerRound, zeroIndexRound) => {
  let zeroIndexWorker = worker - 1;
  let arrayStart = (zeroIndexRound * maxWorkers * seedsPerRound) + (zeroIndexWorker * seedsPerRound);
  const timer2 = timerFn('test-timer');
  //timer2.start();
  let itemArray = createItemArray(max, arrayStart);
  //timer2.stop();
  //console.log(`Array loaded in ${timer2.seconds()} seconds.`)
  timer2.start();

  carouselItem.collection.bulkWrite(itemArray)
  .then((res)=> {
    timer2.stop();
    console.log(`Worker ${worker} has inserted ${res.insertedCount} items in ${timer2.seconds()} seconds.`)
  })
} 

module.exports = function(args) {
  const {worker, maxWorkers} = args;

  setTimeout(function() {
    mongooseDBSeed(1300000, worker + 1, maxWorkers);
  }, 1000)
}

