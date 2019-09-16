var faker = require('faker');
const timerFn = require('timer-node');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Pool, Client } = require('pg')


const pool = new Pool({
  database: 'shazamazon',
})

const csvWriter = createCsvWriter({
    path: 'database/data/postgresData.csv',
    header: [
        {id: 'ProductId', title: 'ProductId'},
        {id: 'ItemName', title: 'ItemName'},
        {id: 'Price', title: 'Price'},
        {id: 'Rating', title: 'Rating'},
        {id: 'RatingCount', title: 'RatingCount'},
        {id: 'Category', title: 'Category'},
        {id: 'Photo', title: 'Photo'},
    ]
});

const writeToCSV = async () => {
  const timer = timerFn('test-timer');
  timer.start();
  const timerGlobal = timerFn('test-timer');
  timerGlobal.start();
  let records = [];
  for(let i = 0; i < 10400000; i++){
    let record = {
      ProductId: i,
      ItemName: faker.commerce.productName(),
      Price: Number((Math.random() * 1000).toFixed(2)),
      Rating: Math.floor((Math.random() * 5) + 1),
      RatingCount: Math.floor((Math.random() * 20000) + 1),
      Category: faker.commerce.department(),
      Photo: 'http://lorempixel.com/150/150/technics/'
    }
    records.push(record);
  }
  
  await csvWriter.writeRecords(records) 
  await timer.stop();
  await console.log(`10.4 million records written to CSV in ${timer.seconds()}.${timer.milliseconds()} seconds`);

  const timer2 = timerFn('test-timer');
  await timer2.start();
  let queryString = "DROP TABLE IF EXISTS carousel_items;";
  await pool.query(queryString)
  queryString = "CREATE TABLE carousel_items ( ProductId INT PRIMARY KEY, ItemName TEXT, Price REAL, Rating INT, RatingCount INT, Category TEXT, Photo TEXT);";
  await pool.query(queryString)
  await console.log('Table Created')

  queryString = "COPY carousel_items FROM '/Users/arohan/Google Drive/Continued Education/Galvanize/Course/Shazamazon/Scale-carousel/module-the-best-carousel-master/database/data/postgresData.csv' DELIMITERS ',' CSV HEADER;";
  await pool.query(queryString)
  await pool.end();
  
  await timer2.stop();
  await console.log(`Database loaded in ${timer2.seconds()}.${timer2.milliseconds()} seconds`)

  await timerGlobal.stop();
  await console.log(`Total operation time: ${timerGlobal.seconds()}.${timerGlobal.milliseconds()} seconds`)

}

writeToCSV();
