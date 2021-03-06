Candy = require('./candy_model')
Cart = require('./cart_model')
config = require('../config/config_vars')
var _ = require('underscore')
var stripe = require("stripe")(config.stripe.skId)

var cart = new Cart()
var errorMessage = ''
var candiesInCart = []
var runningPrice = 0
var runningPriceObj = {}

var getDollarAmount = function(priceAsStr) {
	return priceAsStr.slice(0, priceAsStr.length - 2)
}

var getCentAmount = function(priceAsStr) {
	return priceAsStr.slice(-2)
}

module.exports = function(app) {
	app.get('/', (request, response) => { 
		car = new Cart()
		candiesInCart = []
		runningPrice = 0
		runningPriceObj = {}
		cart.emptyCart()
		candiesInCart = []
		response.render('home', {
		candies: Candy.getCandies(),
		errorMessage: errorMessage
	  })
	})

	app.get('/cart', (request, response) => { 
		var items = cart.getItems()
		_.each(items, function(item) {
			var itemInCart = _.findWhere(candiesInCart, {id: item.id});
			if (_.isUndefined(itemInCart) || itemInCart.quantity !== item.quantity) {
				var candy = Candy.findById(item.id)
				candy.quantity = item.quantity
				candy.totalPrice = candy.quantity * candy.price
				var totalPriceAsStr = candy.totalPrice.toString()
				candy.dollarAmount = getDollarAmount(totalPriceAsStr)
				candy.centAmount = getCentAmount(totalPriceAsStr)
				if (candy.dollarAmount === "") {
					candy.dollarAmount = '0'
				}
				if (candy.centAmount.length === 1) {
					candy.centAmount = '0' + candy.centAmount
				}
				
				runningPrice += candy.totalPrice
				candiesInCart.push(candy)
			}
		})
		var runningPriceAsStr = runningPrice.toString()
		runningPriceObj.dollarAmount = getDollarAmount(runningPriceAsStr)
		runningPriceObj.centAmount = getCentAmount(runningPriceAsStr)
	  	response.render('cart', {
	    	candiesInCart: candiesInCart,
	    	runningPrice: runningPrice,
	    	runningPriceObj: runningPriceObj
		})
	})

	app.post('/cart', (request, response) => { 
		errorMessage = ''
		var formAnswers = request.body
		var quantities = formAnswers.quantities
		var ids = formAnswers.ids
		var zippedGroups = _.zip(ids, quantities)
		var items = []
		var totalNumItemsOrdered = 0
		_.each(zippedGroups, function(item) {
			var quantity = parseInt(item[1]);
			if (quantity > 0) {
				var itemToAdd = {
					id: parseInt(item[0]),
					quantity: quantity
				}
				totalNumItemsOrdered += itemToAdd.quantity
				cart.addItem(itemToAdd)
			}
		})
		if (totalNumItemsOrdered > 2) {
			errorMessage = 'You cannot order more than two items at once.'
			response.redirect('back')
		} else {
			errorMessage = ''
			response.redirect('/cart')
		}
	})

	app.post('/checkout', (request, response) => { 	
		var body = request.body
  		var stripeToken = body.stripeToken
  		// Charge the user's card:
		stripe.charges.create({
		  amount: body.chargeAmount,
		  currency: "usd",
		  description: "Example charge",
		  source: stripeToken,
		}).then(function(charge) {
			request.session.charge = charge
			response.redirect('/confirmation')
		}, function(error) {
			errorMessage = 'Unable to charge your card.'
			response.redirect('back')
		})
	})

	app.get('/confirmation', (request, response) => { 
		var charge = request.session.charge
		var chargeAmountAsStr = charge.amount.toString()
		var chargeAmountDollars = getDollarAmount(chargeAmountAsStr)
		var chargeAmountCents = getCentAmount(chargeAmountAsStr)
		response.render('confirmation', {
	    	candiesInCart: candiesInCart,
	    	runningPrice: runningPrice,
	    	runningPriceObj: runningPriceObj,
	    	chargeAmountDollars: chargeAmountDollars,
	    	chargeAmountCents: chargeAmountCents,
	    	cardInfo: charge.source
		})
	})
}	

