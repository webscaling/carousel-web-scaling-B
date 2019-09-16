DROP TABLE IF EXISTS carousel_items;

CREATE TABLE carousel_items (
  ProductId INT PRIMARY KEY,
  ItemName TEXT,
  Price REAL,
  Rating INT,
  RatingCount INT,
  Category TEXT,
  Photo TEXT
)