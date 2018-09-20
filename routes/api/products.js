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



module.exports = router;
