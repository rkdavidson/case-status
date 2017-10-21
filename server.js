// NPM Dependencies
const express = require('express');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const uuid = require('uuid');
const requestPromise = require('request-promise-native');
const cheerio = require('cheerio');

// Server Files
const dateUtils = require('./server/dateUtils');

// ----------------------------------------

const app = express();
const port = 8080;

// Define important file paths
const paths = {
  public: path.join(__dirname, 'public'),
  cache: path.join(__dirname, 'cache')
};

// Setup static public path
app.use( express.static(paths.public) );


// :: FUNCTIONS
// ----------------------------------------

const getCachePath = (...pathParts) => path.join(paths.cache, ...pathParts);
const curryGetCachedStatusPath = (caseId) => (...pathParts) => getCachePath(caseId, ...pathParts);

function generateCachedStatusFileName() {
  const timestamp = dateUtils.getFilenameTimestamp();
  const hash = uuid().slice(-7);

  return `status_${timestamp}_${hash}.json`;
}


async function cacheCaseStatusData(caseId, content) {
  const getCachedStatusPath = curryGetCachedStatusPath(caseId);
  const statusFilePath = getCachedStatusPath( generateCachedStatusFileName() );
  const latestSymlink = getCachedStatusPath('_latest.json');

  try {
    // :: Make sure a directory exists in the cache for this case
    await fse.ensureDir( getCachedStatusPath() );
    console.log('✅  Cache directory exists for this case');

    // :: Store the status data
    await fse.writeJson(statusFilePath, content)
    console.log('✅  Wrote status json');

    // :: Update latest symlink
    await updateSymlink(statusFilePath, latestSymlink);
    console.log('✅  Success updating latest status symlink');
  } catch (err) {
    console.error('❌  Error: ', err);
  }
}

async function updateSymlink(srcPath, symlinkPath) {
  console.log(`↘️  updateSymlink(${srcPath}, ${symlinkPath})...`);
  const tmpSymlinkPath = `${symlinkPath}.tmp`;

  await fse.ensureSymlink(srcPath, tmpSymlinkPath);
  console.log('✅  Success creating temporary symlink');

  await fse.move(tmpSymlinkPath, symlinkPath, { overwrite: true });
  console.log('✅  Success moving symlink');

  console.log('↙️ updateSymlink() complete');
}

console.log('Creating latest cached file...');
cacheCaseStatusData('rkd-test', ["StUFF", { name: "rkd", id: 0 }]);

// >> case status number
// Create folder for case status number if one doesnt exist
// Create new case status json file
// Update symlink to point to that file

async function getCaseStatus(caseId) {
  return new Promise(async function(resolve, reject) {
    if (!caseId) {
      reject('No case id provided');
    }

    // Check for cached file
    // await jsonfile.readFile(getCachePath(caseId), function(err, obj) {
    //   console.dir(obj)
    // })

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

// :: ROUTING
// ----------------------------------------

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