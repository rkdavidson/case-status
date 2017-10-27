// Setup mongoose db connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://mongo/test', { useMongoClient: true });
mongoose.Promise = global.Promise;

// Mongoose Model Setup
const CaseStatus = mongoose.model('CaseStatus', require('./mongoose/CaseStatus'));


function createCaseStatus(caseId, headline, summary) {
  console.group('[ db.createCaseStatus ]');
  console.log('caseId:', caseId);
  console.log('headline:', headline);
  console.log('summary:', summary);

  return new Promise( (resolve, reject) => {
    const caseStatus = new CaseStatus({
      caseId,
      headline,
      summary
    });
    caseStatus.save((err, savedCaseStatus) => {
      if (err) {
        console.log('--> Mongo save failure: ', err);
        console.groupEnd();
        reject(err);
      }

      console.log('--> Mongo db save success!\n', savedCaseStatus);
      console.groupEnd();
      resolve(savedCaseStatus);
    });
  });
}

module.exports = {
  createCaseStatus
};