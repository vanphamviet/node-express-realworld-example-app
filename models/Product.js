var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var User = mongoose.model('User');

var ProductSchema = new mongoose.Schema({
  name: String,
  description: String
}, {timestamps: true});

ProductSchema.plugin(uniqueValidator, {message: 'is already taken'});

ProductSchema.pre('validate', function(next){
  next();
});


ProductSchema.methods.toJSONFor = function(user){
  return {
    name: this.name,
    description: this.description,
    createdAt: this.createdAt,
    id: this._id,
    updatedAt: this.updatedAt
  };
};

mongoose.model('Product', ProductSchema);
