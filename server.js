const express = require('express');
const path = require('path');
const PythonShell = require('python-shell');
const requestPromise = require('request-promise-native');
const cheerio = require('cheerio');

// ----------------------------------------

const app = express();
const port = 8080;

// Define important file paths
const paths = {
  public: path.join(__dirname, 'public')
};

// Setup static public path
app.use( express.static(paths.public) );


// :: ROUTING
// ----------------------------------------

app.get('/', function (request, response) {
  response.send('Hello World!');
});

async function getPythonData() {
  return new Promise((resolve, reject) => {
    const python = new PythonShell('get-case-statuses.py');
    let result;
  
    python.on('message', function handleMessage(message) {
      console.log('Message received! ', message);
      result = message;
    });
  
    python.end(function handleEnd(err) {
      if (err) {
        console.error('Error from python! ', err);
        reject(err);
      }
      
      console.log('Success! result: ', result);
      resolve(result);
    });
  });
}

app.get('/python', async function (request, response) {
  const pythonData = await getPythonData().catch(error => {
    console.log('Crap, we got an error from getPythonData: ', error);
    response.status('403').send('Sorry, could not get python data because ' + error);
  });

  response.send(pythonData);
});

app.get('/google', async function(request, response) {
  const response = await requestPromise.get('https://egov.uscis.gov/casestatus/mycasestatus.do?appReceiptNum=MSC1791555062');
  const $ = cheerio.load(googleResponse);
  const getFormElement = (selector) => $(`form[name="caseStatusForm"] .appointment-sec .rows ${selector}`)
  const headline = getFormElement('h1');
  const summary = getFormElement('p');

  response.send('Worked? h1: ' + h1);
});


// :: START
// ----------------------------------------

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});