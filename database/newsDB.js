const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema = new Schema({
  url: String,
  description: String,
  headline: String,
  image: String,
  keyword: String
});

const Article = mongoose.model('Article', newsSchema);

const searchDatabase = inputKeyword => {
  return mongoose
    .model('Article')
    .findOne({keyword: inputKeyword})
    .exec();
};

const createNewArticle = inputNews => {
  let article = new Article ({
    url: inputNews.url,
    description: inputNews.description,
    name: inputNews.name,
    image: inputNews.image,
    keyword: inputNews.keyword
  });
  return article;
};

const saveIntoDatabase = inputNews => {
  searchDatabase(inputNews.keyword)
    .then(found => {
      if (!found) {
        const newartcile = createNewArticle(inputNews);
        newartcile.save();
      }
    })
};

module.exports.Article = Article;
module.exports.saveIntoDatabase = saveIntoDatabase;
module.exports.searchDatabase = searchDatabase;