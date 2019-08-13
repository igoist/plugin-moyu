const baseUrl = 'https://www.printf520.com:8080/GetType';

declare var chrome: any;

const promiseWrap = (url: string) => {
  // return new Promise((resolve) => {
  //   let xhr = new XMLHttpRequest();
  //   xhr.overrideMimeType('application/json');
  //   xhr.open('GET', url);
  //   xhr.onload = () => {
  //     if (xhr.status >= 200 && xhr.status < 300) {
  //       resolve(JSON.parse(xhr.response));
  //     }
  //   };
  //   xhr.send();
  // });
  return fetch(url)
    .then((res: any) => res.json())
    .then(json => json);
};

type requestAsyncCallback = (data: any) => void;

export const requestTypeAsync = async (callback: requestAsyncCallback) => {
  if (process.env.NODE_ENV === 'development') {
    let data: any = await promiseWrap(baseUrl);

    if (data.Code === 0) {
      callback(data.Data);
    } else {
      console.log('API request error.');
      console.log('requestAsync data: ', data);
    }
  }
  if (process.env.NODE_ENV === 'production') {
    chrome.runtime.sendMessage({ msg: 'requestTypeAsync' }, function(res: any) {
      if (res) {
        console.log('get response: ', res);
        callback(res);
      }
    });
  }

};

export const requestListAsync = async (dataId: number, callback: requestAsyncCallback) => {
  if (process.env.NODE_ENV === 'development') {
    let data: any = await promiseWrap(`${ baseUrl }Info?id=${ dataId }`);

    if (data.Code === 0) {
      callback(data.Data);
    } else {
      console.log('API request error.');
      console.log('requestAsync data: ', data);
    }
  }
  if (process.env.NODE_ENV === 'production') {
    chrome.runtime.sendMessage({ msg: 'requestListAsync', dataId }, function(res: any) {
      if (res) {
        callback(res);
      }
    });
  }
};

// export default {
//   requestTypeAsync
// }
