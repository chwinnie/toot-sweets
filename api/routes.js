Candy = require('./candy_model')
Cart = require('./cart_model')
var _ = require('underscore')
var stripe = require("stripe")("sk_test_4xKohW2yCQD3RpskZZOoIhKa")

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
	  response.render('home', {
	    candies: Candy.getCandies(),
	    errorMessage: errorMessage
	  })
	})

	app.get('/cart', (request, response) => { 
		var items = cart.getItems()
		_.each(items, function(item) {
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
			var itemToAdd = {
				id: parseInt(item[0]),
				quantity: parseInt(item[1])
			}
			totalNumItemsOrdered += itemToAdd.quantity
			cart.addItem(itemToAdd)
		})
		if (totalNumItemsOrdered > 2) {
			errorMessage = 'You cannot order more than two items at once.'
			cart.emptyCart()
			response.redirect('back')
		} else {
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

