require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');
const { carouselItem } = require('../database/mongoose.js');
const mongoose = require('mongoose');
const timerFn = require('timer-node');
const timer = timerFn('test-timer');
const { Pool, Client } = require('pg');

const app = express();
app.use(bodyParser.json());

app.get('/handleQuery', (req, res) => {
  let request = JSON.parse(req.query.request);

  //mongo
  carouselItem.find(request.Category !== undefined ? { Category: request.Category } : { ProductId: request.ProductId } ).limit(100)
  .exec()
  .then(doc => {
    res.status(200).send(doc);
  })
  .catch(err => {
    console.log(err)
    res.status(500).end();
  });

  //Postgres
  // const pool = new Pool({
  //   database: 'shazamazon',
  //   max: 11000
  // })

  // let spec = request.Category ? `category='${request.Category}'` : `productid='${request.ProductId}'`
  // let queryString = `SELECT * FROM carousel_items WHERE ${spec} LIMIT 100;`;
  // pool.query(queryString, (err, response) => {
  //   if (err) console.log(err)
  //   pool.end();

  //   let translations = [];
  //   response.rows.forEach(row => {
  //     let obj = {
  //       ProductId: row.productid,
  //       ItemName: row.itemname,
  //       Price: row.price,
  //       Rating: row.rating,
  //       RatingCount: row.ratingcount,
  //       Category: row.category,
  //       Photo: row.photo
  //     };
  //     translations.push(obj);
  //   })
  //   res.send(translations);
  // })
})

  

//Uncomment to use nodemon
// const port = 7000;
// app.listen(port, () => { console.log(`we are listening from port ${port}`); });

module.exports = function(args) {
  const {worker, maxWorkers} = args;
  console.log(`There are ${maxWorkers} workers`)

  const port = 7000 + worker;
  console.log(port)
  app.listen(port, () => { console.log(`we are listening from port ${port}`); });
}