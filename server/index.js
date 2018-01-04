const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const stockmarketController = require('../controllers/stockmarket.js');
const bingSearchController = require('../controllers/bing.js');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dist = path.resolve(__dirname, './../react-client/dist')
const port = process.env.PORT || 8080

mongoose.connect('mongodb://localhost/stockmarket', {useMongoClient: true});

app.use(cors());
app.use(express.static(dist));

app.use(bodyParser());

app.get('*', (req, resp) => resp.sendFile(path.resolve(dist, 'index.html')))

app.get('/renderStock', (req, resp) => stockmarketController.get(req, resp));
app.post('/renderStock',  (req, resp) => stockmarketController.post(req, resp));

app.get('/renderNews', (req, resp) => bingSearchController.get(req, resp));
app.post('/renderNews',  (req, resp) => bingSearchController.post(req, resp));

app.listen(PORT, () => {
	console.log('listening to 8080');
});
