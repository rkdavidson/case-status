const express = require('express');
const path = require('path');
const requestPromise = require('request-promise-native');

// -------
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (request, response) {
  res.send('Hello World!');
});

app.get('/google', async function(request, response) {
  const googleResponse = await requestPromise.get('http://google.com');
  console.log('google response: ', googleResponse);

  // reply('success!');
  response.send('Worked?');
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});