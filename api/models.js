var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var candyDatabaseFilename = path.join(__dirname, '../config', 'candy.json');
var candyData = fs.readFileSync(candyDatabaseFilename);
var candyDataAsJson = JSON.parse(candyData);

var Candy = function(name, price, image) {
	this.name = name;
	this.price = price;
	this.image = image;
}

Candy.getCandies = function() {
	return candyDataAsJson.candies;
}

Candy.findById = function(id) {
	return _.findWhere(candyDataAsJson.candies, {id: id});
}

console.log(Candy.getCandies());
console.log(Candy.findById(1));