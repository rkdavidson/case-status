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

async function getCaseStatus(caseId) {
  return new Promise(async function(resolve, reject) {
    if (!caseId) {
      reject('No case id provided');  
    }

    const html = await requestPromise.get(`https://egov.uscis.gov/casestatus/mycasestatus.do?appReceiptNum=${caseId}`);
    const $ = cheerio.load(html);
    const getFormElementText = (selector) => $(`form[name="caseStatusForm"] .appointment-sec .rows ${selector}`).text();
    const headline = getFormElementText('h1');
    const summary = getFormElementText('p');
    console.log('headline: ', headline);
    console.log('summary: ', summary);
  
    if (headline && summary) {
      resolve({
        caseId,
        headline,
        summary
      });
    }
    
    reject('Unknown error getting headline and summary');
  });
}

async function getCaseStatuses(caseIds) {
  return Promise.all( caseIds.map(getCaseStatus) );
}

app.get('/case', async function(request, response) {
  const caseStatus = await getCaseStatus('MSC1791555062');

  response.send('Worked? caseStatus: ' + JSON.stringify(caseStatus, null, 2));
});

app.get('/cases', async function(request, response) {
  const caseStatuses = await getCaseStatuses(['MSC1791555061', 'MSC1791555062', 'MSC1791555063']);

  response.send('Worked? caseStatuses: ' + JSON.stringify(caseStatuses, null, 2));
});


// :: START
// ----------------------------------------

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});