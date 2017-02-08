require('./models');

module.exports = function(app) {
	app.get('/', (request, response) => {  
	  response.render('test', {
	    name: 'John'
	  })
	})
}	

