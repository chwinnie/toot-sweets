var path = require('path');
var express = require('express');  
var bodyParser = require('body-parser'); 
var exphbs = require('express-handlebars');
var session = require('express-session')

var app = module.exports = express(); 
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(session({ secret: 'keyboard cat'}))
app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 3002;
var candy = require('./config/candy.json');
require('./api/routes.js')(app);

app.engine('.hbs', exphbs({  
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: __dirname + '/views/partials/'
}))
app.set('view engine', '.hbs')  
app.set('views', path.join(__dirname, 'views'))  

app.listen(port, (err) => {  
  if (err) {
    return console.log('Something went wrong', err)
  }

  console.log(`server is listening on ${port}`)
});

app.use((err, request, response, next) => {  
  // log the error, for now just console.log
  console.log(err)
  response.status(404).send("That page doesn't exist! Maybe someone ate it?")
  response.status(500).send('Uh-oh, something went wrong! Please refresh and try again.')

})



