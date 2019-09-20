# A Simple Item Carousel

Enclosed is an item carousel built in vanilla JS, modeled after popular e-commerce functionalities.

The carousel was designed by my colleague Jeff Salinas for a larger e-commerce item page we worked on [LINK]. I had worked on the reviews module, and him on the carousel but we both decided to handle the scaling of each-other’s components.

The carousel renders items based on two database queries. The first returns the category of an item based on its Product ID, and the second returns related items that are also in that category.

Our goal was to have our servers able to handle 300 RPS with low latency, and 1000 without crashing.


## On deciding between MongoDB and Postgres:

In order to scale this app up, I considered two routes:
1. Optimize and scale the existing Mongo database
2. Shift to a different database entirely

In this case, the database was Postgresql, as I was also interested to see if performance on a SQL based database would be more efficient.

The analysis is structured via comparisons on the following topics:

1. Database seed time
2. Database Querying time
3. Load-testing


## Getting Started

1. Install npm packages:
```
npm install
```
2. Create a config.js file inside the ./database directory.
```
cd ./database
touch config.js
```

3. a. If using Mongo, uncomment the Mongo section in server/server.js.
3. b. If using Postgres, uncomment the Postgres section.
3. c. If using Load balancing (via mongo), uncomment the 'load balancing section and edit math.random to match the number of threads that farm-cli will eventually run.

4. a. Start the server using npm and nodemon for 2 instances:
```
npm start
```

4. b. Start the load balancing servers using farm-cli (npm i farm-cli):
```
farm load-balancer/server.js
```

5. Go to localhost:4444 or localhost:4445 to view the app.


## Database Seeding

For both Mongo and Postgres, options for seeding included uploading a csv or writing a script to populate the database. I opted to test both methods as I wanted to automate as much as possible. 

### MongoDB (Seeding from Node)

Here I’ve created a script (mongoSeed.js) that is able to load 10.4 million items in about five minutes. On its own, the script is able to seed 50,000 items at a time in increments. The increments exist to that the mongod process has time to write the new files to the db.

By itself, the single-thread node process is slow, but by using the farm-cli, we are able to speed up the process by running several instances simultaneously. In my case, I was able to run 8 threads on my quad-core processor. 

Post seeding, there is a call to index the database on two properties - the Product ID (numeric) and the Category(text). I had originally done this during seeding, calling for indexing after every 50,000 items but this had a toll on efficiency, instead I’ve used farm-cli to recognize when the last thread has performed the last seed, and then assigning that thread to perform the indexing. 

To run the seed:
```
farm database/mongoSeed.js
```

Further optimizations:
- If we extract the mongo process to a deployed instance, we should be able to severely reduce the seed time as we will not have to wait for the mongod process on the local machine. This seemed to be the case on the Atlas cluster but I was unable to test further as I quickly hit the free tier limits. 


### Postgresql (Seeding from CSV via Node)

Postgres seeding is done differently. I have designed a script that has made it fully automatic, but it does involve writing files. The Postgres database is seeded by generating a .csv file (using the csv-writer npm package) and then querying the ‘copy’ command to add the file to the table.

Indexing does not seem necessary yet as the itemID is automatically indexed as the primary key. Queries for the category are also responsive, even under load.

Seeding the database is a lot faster than mongo, at around 130 seconds. 

To run the seed, replace the max-old-space variable with the amount of ram you are willing to allocate to node:
```
node --max-old-space-size=8000 database/postgresSeed.sql
```

## Routes

For query and load-testing, the same route was tested on the server. However, this route sends one of two possible queries to the databases:

- If a parameter is an itemid, one row/document is requested in order to extract the item’s category.

- If a category is provided, 100 rows/documents are requested for other items in that category, capped by the query. Originally this was uncapped and would return all items of a category. This was then capped at 200 but I found it was a taxing query. I’ve now limited it to 100 as it produces around 17 pages of items for the user, which I think is more than enough.

## Query Times

The queries for all four db routes (routed via express in node) are listed below load tested under the specified RPS for one minute:

| RPS | MongoDB Item  (return one document) | MongoDB Category  (return 100 documents) | Postgres Item  (return one document) | Postgres Category  (return 100 documents) |
|-----|-------------------------------------|------------------------------------------|--------------------------------------|-------------------------------------------|
| 100 | 4ms                                 | 8.5ms                                    | 9ms => 6.9ms                         | 7.6ms                                     |
| 200 | 3.5ms                               | 18.8ms                                   | 7.7ms                                | 69.4ms*                                   |
| 250 |                                     | 3296.7ms                                 |                                      | 739.6ms                                   |
| 300 | 2.6ms                               | 6076.2ms^                                | 1280.5ms^*                           | 983.1ms^*                                 |

^high error rate
*crash

It seems mongo is more stable underload. From the above, the recommendation for load balancing would be to make sure that no server is handling more than 200 RPS.

I was able to optimize Postgres a little further after looking at indexing methods, I am now indexing post-seed instead of relying on the primary key which is supposedly more performant.

## Load Testing

A single server is only able to handle less than 300rps when linked to either Postgres or Mongo. Mongo seems to be slightly more performant, especially at higher loads where Postgres seems to default to crashing.

I’ve implemented load balancing via setting up 8 server instances for routes that query the database and although the average query time under light load has increased to roughly 8ms, the server is no longer crashing at high loads. I am able to send 1000 RPS with a high error rate without the server crashing but I am at the limits of my hardware. 

