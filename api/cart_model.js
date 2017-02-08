var Cart = function() {}

Cart.prototype.items = []

Cart.prototype.addItem = function(item) {
	this.items.push(item)
}

Cart.prototype.getItems = function() {
	return this.items
}

Cart.prototype.emptyCart = function() {
	this.items = []
}


module.exports = Cart