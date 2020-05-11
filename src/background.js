const baseUrl = 'http://localhost:6085';
const timeDelta = 2000 * 1000;

let types = {
  data: null,
  timestamp: null
};

let listHistory = {};

window.types = types;
window.listHistory = listHistory;


const promiseWrap = (url) => {
  console.log('enter promiseWrap: ', url);
  return fetch(url)
    .then((res) => res.json())
    .then(json => json);
};

const requestTypeAsync = async (callback) => {
  console.time('requestTypeAsyncTime');
  let data = await promiseWrap(baseUrl);
  console.timeEnd('requestTypeAsyncTime');

  if (data.Code === 0) {
    callback(data.Data);
  } else {
    console.log('BG API request error.');
    console.log('BG requestAsync data: ', data);
    return null;
  }
};

const requestListAsync = async (dataId, callback) => {
  let data = await promiseWrap(`${ baseUrl }/api/v1/list/${ dataId }`);

  if (data.Code === 0) {
    callback(data.list);
  } else {
    console.log('BG API request error.');
    console.log('BG requestAsync data: ', data);
    return null;
  }
};

// chrome.runtime.onInstalled.addListener(function() {
//   console.log('init');
//   requestTypeAsync((data) => {
//     console.log('init data: ', data);
//   });
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request: ', request.msg);
  let tmpTimestamp;
  switch(request.msg) {
    case 'requestTypeAsync':
      console.log('enter requestTypeAsync: ', types);
      tmpTimestamp = new Date();
      if (types.timestamp) {
        if (tmpTimestamp - types.timestamp > timeDelta) {
          requestTypeAsync(data => {
            types = {
              data: data,
              timestamp: tmpTimestamp
            };
            console.log('requestTypeAsync request new data: ', types);
            sendResponse(data);
          });
        } else {
          console.log('requestTypeAsync is using old data: ', types);
          sendResponse(types.data);
        }
      } else {
        requestTypeAsync(data => {
          types = {
            data: data,
            timestamp: tmpTimestamp
          };
          console.log('requestTypeAsync first time request data', types);
          sendResponse(data);
        });
      }
      return true;
    case 'requestListAsync':
      console.log('enter requestListAsync: ', listHistory);
      tmpTimestamp = new Date();
      let tmpObj = listHistory[request.dataId];
      if (tmpObj) {
        if (tmpTimestamp - tmpObj.timestamp > timeDelta) {
          requestListAsync(request.dataId, data => {
            listHistory[request.dataId] = {
              data: data,
              timestamp: tmpTimestamp
            };
            console.log('requestListAsync request new data: ', listHistory);
            sendResponse(data);
          });
        } else {
          console.log('requestListAsync is using old data: ', listHistory, tmpObj);
          sendResponse(tmpObj.data);
        }
      } else {
        requestListAsync(request.dataId, data => {
          listHistory[request.dataId] = {
            data: data,
            timestamp: tmpTimestamp
          };
          console.log('requestListAsync first time request data', listHistory, listHistory[request.dataId]);
          sendResponse(data);
        });
      }
      return true;
    default:
      return null;
  }
});
