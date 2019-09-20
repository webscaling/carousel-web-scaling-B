require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');
const { carouselItem } = require('../database/mongoose.js');
const mongoose = require('mongoose');
const timerFn = require('timer-node');
const timer = timerFn('test-timer');
const { Pool, Client } = require('pg');

const axios = require('axios');

const app = express();
const app2 = express();
const port = 4444;


app.use(express.static('client'));
app.use(bodyParser.json());

app2.use(express.static('client'));
app2.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app2.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/item', (req, res) => {
  const item = new carouselItem({
    _id: new mongoose.Types.ObjectId(),
    ProductId: req.body.ProductId,
    ItemName: req.body.ItemName,
    Price: req.body.Price,
    Rating: req.body.Rating,
    RatingCount: Math.floor(Math.random() * 20) + 1,
    Category: req.body.Category,
    Photo: req.body.Photo[0],
  });
  item.save()
    .then(result => {
      res.status(201).send({
        message: 'handling POST requests to /item',
        createdProduct: result
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});



app.get('/item', (req, res) => {

  //Mongo Load Balancing
  let proxy = Math.floor(Math.random() * 8)

  axios.get(`http://127.0.0.1:${7000 + proxy}/handleQuery`, {
    params: {
      request: req.query
    }
  })
  .then(response => {
    res.status(200).send(response.data);
  })
  .catch(err => {
    res.status(500).end();
  });

  //Mongo Route
  // carouselItem.find(req.query.Category !== undefined ? { Category: req.query.Category } : { ProductId: req.query.ProductId } ).limit(100)
  //   .exec()
  //   .then(doc => {
  //     res.status(200).send(doc);
  //   })
  //   .catch(err => {
  //     res.status(500).end();
  //   });

  //Postgres
  // const pool = new Pool({
  //   database: 'shazamazon',
  //   max: 11000
  // })

  // let spec = req.query.Category ? `category='${req.query.Category}'` : `productid='${req.query.ProductId}'`
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
  

});

app2.get('/item', (req, res) => {

  let proxy = Math.floor(Math.random() * 8)

  axios.get(`http://127.0.0.1:${7000 + proxy}/handleQuery`, {
    params: {
      request: req.query
    }
  })
  .then(response => {
    res.status(200).send(response.data);
  })
  .catch(err => {
    res.status(500).end();
  });
})

app.put('/seed', (req, res) => {
  const ratingCount = req.body.length;
  let reviewsArray = [];
  let avgReviews;
  
  req.body.forEach(review => {
    reviewsArray.push(review.rating);
  });

  avgReviews = reviewsArray.reduce((acc, num)=> {
    return acc + num;
  });
  avgReviews = (avgReviews / ratingCount).toFixed(1);

  carouselItem.updateOne({ ProductId: req.body[0].itemID }, { Rating: avgReviews, RatingCount: ratingCount })
    .exec()
    .then(() => {
      res.status(200).end();
    })
    .catch(err => {
      console.error(err);
    });

});

app.put('/item', (req, res) => {
  carouselItem.updateOne({ ProductId: req.body.ProductId }, { Rating: req.body.Rating, RatingCount: req.body.RatingCount })
    .exec()
    .then(() => {
      res.status(200).end();
    })
    .catch(err => {
      console.error(err);
    });
});

app.listen(port, () => { console.log(`we are listening from port ${port}`); });
app2.listen(4445, () => { console.log(`we are listening from port 4445`); });

// module.exports = function(args) {
//   const {worker, maxWorkers} = args;
//   console.log(`There are ${maxWorkers} workers`)

//   const port = 4400 + worker;
//   app.listen(port, () => { console.log(`we are listening from port ${port}`); });
// }
