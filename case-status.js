window.addEventListener('load', init, false);


function init() {
  console.log('--- init() ---');
  checkStatus();
}

function checkStatus() {
  fetch('https://egov.uscis.gov/casestatus/mycasestatus.do?appReceiptNum=MSC1791555063', {
    method: 'GET',
    mode: 'cors',
    // redirect: 'follow',
    // headers: defaultHeaders
  }).then(function(response) {
    console.log('response :: ', response);
    return response.text();
  }).then(function(text) {
    console.log('TEXT :: ', text);
  });
}

// function setHeaders() {
//   // Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
//   // Accept-Encoding:gzip, deflate, br
//   // Accept-Language:en-US,en;q=0.8
//   // Cache-Control:max-age=0
//   // Connection:keep-alive
//   // Content-Length:133
//   Content-Type:application/x-www-form-urlencoded
//   Cookie:JSESSIONID=86C6BC8D74806D9D80CA11BFBDFDB8A7; _gat_GSA_ENOR0=1; _ga=GA1.3.980670285.1506620846; _gid=GA1.3.1047331062.1506620846
//   // Host:egov.uscis.gov
//   Origin:https://egov.uscis.gov
//   Referer:https://egov.uscis.gov/casestatus/mycasestatus.do
//   // Upgrade-Insecure-Requests:1
// }
