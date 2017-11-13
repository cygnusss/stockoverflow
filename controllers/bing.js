const api_key = require('../config.js').bing;
const Promise = require('bluebird');
const request = require('request');
const db = require('../database/newsDB.js');
const _ = require('underscore');

const searchApiForArticle = keyword => {
  return new Promise((resolve, reject) => {
    const options = {
      "method": "GET",
      "uri": `https://api.cognitive.microsoft.com/bing/v7.0/news/search/?q=${keyword}`,
      "headers": {
        "Ocp-Apim-Subscription-Key": api_key
      }
    };
    request(options, (err, resp, body) => {
      if (err) reject(err);
      resolve(body);
    });
  });
};

const queryDatabase = keyword => {
  return new Promise((resolve, reject) => {
    db.Article.find({keyword: keyword}, (err, found) => {
      if (found) resolve(found);
      reject(err || found);
    });
  });
}

const parseArticleObject = (article, keyword) => {
  let output = {};
  output.url = article.url;
  output.description = article.description;
  output.name = article.name;
  output.image = article.image.thumbnail.contentUrl;
  output.keyword = keyword;
  return output;
};

module.exports = {
  get: (req, resp) => {
    const keyword = req.query.name.toUpperCase();
    queryDatabase(keyword)
      .then(targetSubjectArray => {
        resp.writeHead(200, {"Content-Type": "application/json"});
        resp.end(JSON.stringify(targetSubjectArray));
      })
      .catch(err => console.error(err));
  },

  post: (req, resp) => {
    const keyword = req.body.name.toUpperCase();

    db.searchDatabase(keyword)
      .then(databaseQueryResult => {
        return !databaseQueryResult ? searchApiForArticle(keyword) : null;
      })    
      .then(queryResults => {
        if (queryResults) {
          const parsedQueryResults = JSON.parse(queryResults);
          const arrayOfArticles = parsedQueryResults.value;
          
          return _.reduce(arrayOfArticles, (articles, currArticle) => {
            if (currArticle.image) {
              const parsedObject = parseArticleObject(currArticle, keyword);
              articles.push(parsedObject);
            }
            return articles;
          }, []);
        } 
        else return null;
      })
      .then(arrayOfArticles => {
        if (arrayOfArticles) {
          for (const article of arrayOfArticles) {
            db.saveIntoDatabase(article);
          }
          resp.writeHead(201, {"Content-Type": "text/plain"});
          resp.end('Success');
        }
      })
      .catch(err => new Error(err));
  }
};




// OUTPUT FORMAT
/*
  article = {
    url: article.web_url,
    img: 'http://www.nytimes.com/' + article.multimedia[0].url,
    headline: aricle.headline.main
  }
*/





//INPUT FORMAT
/*
{ web_url: 'https://www.nytimes.com/2015/08/19/technology/amazon-workplace-reactions-comments.html',
  snippet: 'Details of working conditions at Amazon led to a response from employees, relatives and friends.',
  blog: {},
  source: 'The New York Times',
  multimedia: 
   [ { type: 'image',
       subtype: 'wide',
       url: 'images/2015/08/13/business/13amazon-selects-slide-AUYG/13amazon-selects-slide-AUYG-thumbWide.jpg',
       height: 126,
       width: 190,
       rank: 0,
       legacy: [Object] },
     { type: 'image',
       subtype: 'xlarge',
       url: 'images/2015/08/13/business/13amazon-selects-slide-AUYG/13amazon-selects-slide-AUYG-articleLarge.jpg',
       height: 400,
       width: 600,
       rank: 0,
       legacy: [Object] },
     { type: 'image',
       subtype: 'thumbnail',
       url: 'images/2015/08/13/business/13amazon-selects-slide-AUYG/13amazon-selects-slide-AUYG-thumbStandard.jpg',
       height: 75,
       width: 75,
       rank: 0,
       legacy: [Object] } ],
  headline: 
   { main: 'Depiction of Amazon Stirs a Debate About Work Culture' },
  keywords: 
   [ { isMajor: null,
       rank: 1,
       name: 'subject',
       value: 'Workplace Environment' },
     { isMajor: null,
       rank: 2,
       name: 'organizations',
       value: 'Amazon.com Inc' } ],
  pub_date: '2015-08-19T00:00:00Z',
  document_type: 'article',
  new_desk: 'Business',
  byline: { original: 'By THE NEW YORK TIMES' },
  type_of_material: 'News',
  _id: '55d3189038f0d80f08415c68',
  word_count: 1139,
  score: 8.77984e-36 }
  */