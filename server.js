// NPM Dependencies
const express = require('express');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const scraper = require('request-promise-native');
const cheerio = require('cheerio');
const db = require('./server/db');

// Server Files
const config = require('./server/config');
const cacheUtils = require('./server/cacheUtils');

// ----------------------------------------

const app = express();
const router = express.Router();
const port = 8080;

// Setup static public path
app.use( express.static(config.paths.public) );


// :: FUNCTIONS
// ----------------------------------------
// cacheUtils.cacheCaseStatus('saturday', { 'data': uuid() });

async function getCaseStatus(caseId) {
  return new Promise(async function(resolve, reject) {
    if (!caseId) {
      reject('No case id provided');
    }

    // Check for cached file
    // await jsonfile.readFile(getCachePath(caseId), function(err, obj) {
    //   console.dir(obj)
    // })

    const html = await scraper.get(`https://egov.uscis.gov/casestatus/mycasestatus.do?appReceiptNum=${caseId}`);
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

// :: ROUTING
// ----------------------------------------

app.get('/test', async function(request, response) {
  try {
    const caseStatus = await db.createCaseStatus('TEST123', 'Fancy Headline', 'Blah blah yadda lorem');
    response.send('Success saving, new CaseStatus record: ' + JSON.stringify(caseStatus, null, 2));
  } catch (err) {
    response.send('Error saving caseStatus.\nErr:\n' + err);
  }
});

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