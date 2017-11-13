const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
  name: String,
  priceDate: String,
  openingPrice: String,
  highPrice: String,
  lowPrice: String,
  closingPrice: String,
  date: { type: Date, default: Date.now }
});

const Stock = mongoose.model('Stock', stockSchema);


// Stock.collection.remove();
// FUNCTION SEARCHES DATABASE
const searchDatabase = targetStock => {
  return mongoose
    .model('Stock')
    .findOne({name: targetStock.name, priceDate: targetStock.priceDate})
    .exec();
};

// Stock.collection.remove();

const createNewstock = inputStock => {
  let newstock = new Stock({
    name: inputStock.name,
    priceDate: inputStock.priceDate,
    openingPrice: inputStock.openingPrice,
    highPrice: inputStock.highPrice,
    lowPrice: inputStock.lowPrice,
    closingPrice: inputStock.closingPrice,
    date: new Date
  });
  return newstock;
};

// mongoose.model('Stock').find((err, results) => {
//   console.log('DATABASE IS ');
//   console.log(results);
// });

// FUNCTION SAVES A STOCK INTO DATABASE
const saveIntoDatabase = inputStock => {
  searchDatabase(inputStock)
  .then(found => {
    if (!found) {
      const newstock = createNewstock(inputStock);
      newstock.save();
    }
  })
};

module.exports.Stock = Stock;
module.exports.saveIntoDatabase = saveIntoDatabase;
module.exports.searchDatabase = searchDatabase;


// REMOVES EVERY ELEMENT IN A COLLECTION: Stock.collection.remove();

/*
{
  "Meta Data": {
      "1. Information": "Intraday (1min) prices and volumes",
      "2. Symbol": "MSFT",
      "3. Last Refreshed": "2017-11-10 16:00:00",
      "4. Interval": "1min",
      "5. Output Size": "Compact",
      "6. Time Zone": "US/Eastern"
  },
  "Time Series (1min)": {
    "2017-11-10 16:00:00": {
        "1. open": "83.8150",
        "2. high": "83.8700",
        "3. low": "83.8000",
        "4. close": "83.8700",
        "5. volume": "3904144"
    },
  }
}
*/