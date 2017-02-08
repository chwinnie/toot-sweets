var path = require('path');
var express = require('express');  
var exphbs = require('express-handlebars');

var app = module.exports = express(); 
var port = process.env.PORT || 3002;
var database = require('./config/database');
var candy = require('./config/candy.json');
require('./api/routes.js')(app);

app.engine('.hbs', exphbs({  
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')  
app.set('views', path.join(__dirname, 'views'))  


app.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});

app.use((err, request, response, next) => {  
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Something broke!')
})



