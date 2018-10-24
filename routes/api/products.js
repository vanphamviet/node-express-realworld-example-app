var router = require('express').Router();
var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var User = mongoose.model('User');
var auth = require('../auth');

// Preload product objects on routes with ':product'
router.param('product', function(req, res, next) {
  console.log('!param');
  
  Product.findOne()
    .then(function (product) {
      if (!product) { return res.sendStatus(404); }

      req.product = product;

      return next();
    }).catch(next);
});


router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var product = new Product(req.body.product);

    return product.save().then(function(){
      return res.json({product: product.toJSONFor(user)});
    });
  }).catch(next);
});

router.get('/', auth.optional, function(req, res, next) {
  console.log('Ui da');

  var query = {};
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }


  Promise.all([
    req.query.author ? User.findOne({username: req.query.author}) : null,
    req.query.favorited ? User.findOne({username: req.query.favorited}) : null
  ]).then(function(results){
    var author = results[0];
    var favoriter = results[1];

    if(author){
      query.author = author._id;
    }

    if(favoriter){
      query._id = {$in: favoriter.favorites};
    } else if(req.query.favorited){
      query._id = {$in: []};
    }

    return Promise.all([
      Product.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('author')
        .exec(),
      Product.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function(results){
      var articles = results[0];
      var articlesCount = results[1];
      var user = results[2];

      return res.json({
        products: articles.map(function(article){
          return article.toJSONFor(user);
        }),
        productsCount: articlesCount
      });
    });
  }).catch(next);
});

module.exports = router;
