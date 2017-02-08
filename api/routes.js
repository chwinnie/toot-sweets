Candy = require('./candy_model');
Cart = require('./cart_model');
var _ = require('underscore');

var cart = new Cart();
var errorMessage = '';

module.exports = function(app) {
	app.get('/', (request, response) => {  
	  response.render('home', {
	    candies: Candy.getCandies(),
	    errorMessage: errorMessage
	  })
	})

	app.get('/cart', (request, response) => { 
		var items = cart.getItems();
		var candiesInCart = [];
		var runningPrice = 0;
		_.each(items, function(item) {
			var candy = Candy.findById(item.id);
			candy.quantity = item.quantity;
			candy.totalPrice = candy.quantity * candy.price;
			runningPrice += candy.totalPrice;
			candiesInCart.push(candy);
		});
	  	response.render('cart', {
	    	candiesInCart: candiesInCart,
	    	runningPrice: runningPrice
		});
	})

	app.post('/cart', (request, response) => { 
		errorMessage = '';
		var formAnswers = request.body;
		var quantities = formAnswers.quantities;
		var ids = formAnswers.ids;
		var zippedGroups = _.zip(ids, quantities);
		var items = [];
		var totalNumItemsOrdered = 0;
		_.each(zippedGroups, function(item) {
			var itemToAdd = {
				id: parseInt(item[0]),
				quantity: parseInt(item[1])
			}
			totalNumItemsOrdered += itemToAdd.quantity;
			cart.addItem(itemToAdd);
		});
		if (totalNumItemsOrdered > 2) {
			errorMessage = 'You cannot order more than two items at once.';
			cart.emptyCart();
			response.redirect('back');
		} else {
			response.redirect('/cart');	
		}
	})
}	

