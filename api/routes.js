Candy = require('./candy_model');
Cart = require('./cart_model');
var _ = require('underscore');
var stripe = require("stripe")("sk_test_4xKohW2yCQD3RpskZZOoIhKa");

var cart = new Cart();
var errorMessage = '';
var candiesInCart = [];
var runningPrice = 0;
var charge = {};

module.exports = function(app) {
	app.get('/', (request, response) => {  
	  response.render('home', {
	    candies: Candy.getCandies(),
	    errorMessage: errorMessage
	  })
	})

	app.get('/cart', (request, response) => { 
		var items = cart.getItems();
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

	app.post('/checkout', (request, response) => { 	
  		var stripeToken = request.body.stripeToken;
  		var me = this;
  		// Charge the user's card:
		stripe.charges.create({
		  amount: 1000,
		  currency: "usd",
		  description: "Example charge",
		  source: stripeToken,
		}).then(function(charge) {
			request.session.charge = charge;
			response.redirect('/confirmation')
		}, function(error) {
			errorMessage = 'Unable to charge your card.'
		});
	})

	app.get('/confirmation', (request, response) => { 
		console.log(request.session.charge);
		response.render('confirmation', {
	    	candiesInCart: candiesInCart,
	    	runningPrice: runningPrice,
	    	cardInfo: request.session.charge.source
		});
	})
}	

