const loadtest = require('loadtest');
const axios = require('axios');
 
// function statusCallback(error, result, latency) {
//     console.log('Current latency %j, error %j', latency, error);
//     console.log('----');
//     // console.log('Request elapsed milliseconds: ', result.requestElapsed);
//     // console.log('Request index: ', result.requestIndex);
//     // console.log('Request loadtest() instance index: ', result.instanceIndex);
// }
 
// const options = {
//     url: `http://localhost:4444/item?ProductId=329432`,
//     maxRequests: 1000000,
//     statusCallback: statusCallback,
//     rps: 10000
// };
 
// loadtest.loadTest(options, function(error) {
//     if (error) {
//         return console.error('Got an error: %s', error);
//     }
//     console.log('Tests run successfully');
// });

// const loadTest = (reqsPerUser) => {
//   for(let i = 0; i < reqsPerUser; i++){
//     axios.get('http://localhost:4444/item', { 
//       params: {
//         ProductId: Math.floor((Math.random() * 10000000))
//       }
//     })
//     .catch(err => console.log(err));
//   }
//   console.log(`${reqsPerUser} requests made`)
// }

// setInterval(function() {
//   loadTest(500)
// }, 1000)

// module.exports = function(args) {
//   setInterval(function() {
//     loadTest(1)
//   }, 1000)
// }
