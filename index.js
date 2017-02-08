require('./app/index')  

var express = require('express');  
var app = express();  
var port = 3002;

app.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});

app.get('/', (request, response) => {  
  throw new Error('oops');
})

app.use((err, request, response, next) => {  
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Something broke!')
})



