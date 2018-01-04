const api_key = require('../config.js').stock;
const Promise = require('bluebird');
const request = require('request');
const db = require('../database/stockDB.js');

// GENERATE TODAYS DATE
const getTodaysDate = () => {
  const date = new Date();

  let mm = date.getMonth() + 1;
  let dd = date.getDate();
  const yyyy = date.getFullYear();

  if(dd<10) dd='0'+dd;
  if (mm<10) mm='0'+mm;

  const today = `${yyyy}-${mm}-${dd}`;
  return today;
};

// TURNS THE GET REQUEST INTO A PROMISE
const searchApiForStock = (type, targetStock) => {
  return new Promise((resolve, reject) => {
    request(`https://www.alphavantage.co/query?function=TIME_SERIES_${type}&symbol=${targetStock.toUpperCase()}&interval=1min&apikey=${api_key}`, (err, resp, data) => {
      if (data) resolve(data);
      reject(err || data);
    });
  });
};

// PROMISIFIES THE FINDONE METHOD
const queryDatabase = targetStockName => {
  return new Promise((resolve, reject) => {
    db.Stock.findOne({name: targetStockName}, (err, found) => {
      if (found) resolve(found);
      reject(found);
    });
  });
};

// RENDERS DAILY STOCK PRICES AS THE OBJECTS PROPS
const renderPrices = (output, data) => {  
  output.openingPrice = data['1. open'];
  output.highPrice = data['2. high'];
  output.lowPrice = data['3. low'];
  output.closingPrice = data['4. close'];
  
  return output;
};


// ONLY RENDERS DATA FOR LATEST STOCK
const parseDailyDataObject = (data, day) => {
  // cosnole.log('data')
  let output = {};
  data = Object
    .values(data)
    .map(stockInfo => Object.values(stockInfo));

  output.name = data[0][1];
  output.priceDate = data[0][2];
  if (!day) {
    const sameDayData = data[1][0];
    output = renderPrices(output, sameDayData);
  }

  return output;
};
// GET REQUEST REQUIRES A TYPE PROPERTY ON THE DATA OBJECT
/* 
REQUEST DATA REQUIREMENT
{
  data: {
    type: 'DAILY',
    name: 'TSLA'
  }
}
*/
module.exports = {
  get: (req, resp) => {
    const target = req.query.name.toUpperCase();
    queryDatabase(target)
      .then(targetStockArray => {
        resp.writeHead(200, {'Content-Type': 'application/json'});
        resp.end(JSON.stringify(targetStockArray));
      })
      .catch(err => new Error(err));
  },
  
  post: (req, resp) => {
    const targetStock = {
      name: req.body.name,
      type: req.body.type
    };
    const searchType = targetStock.type;
    const stockName = targetStock.name;

    searchApiForStock(searchType, stockName)
    .then(targetStockRowData => {
          if (targetStockRowData) {
            const parsedStockData = JSON.parse(targetStockRowData);
            const properStockData = parseDailyDataObject(parsedStockData);

            db.saveIntoDatabase(properStockData)
              .then(results => {
                if (results.length) {
                  resp.writeHead(201, {'Content-Type': 'application/json'});
                  resp.end(JSON.stringify(results));
                }
              })
              resp.writeHead(201, {'Content-Type': 'application/json'});
              resp.end(JSON.stringify(properStockData));
          } 
          else {
            resp.writeHead(404, {'Content-Type': 'text/plain'});
            resp.end()
          }
        })
        .catch(err => console.error(err));
    }
};
