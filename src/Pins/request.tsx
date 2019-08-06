const baseUrl = 'https://www.printf520.com:8080/GetType';

const promiseWrap = (url: string) => {
  return new Promise((resolve) => {
    let xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      }
    };
    xhr.send();
  });
};

type requestAsyncCallback = (data: any) => void;

export const requestTypeAsync = async (callback: requestAsyncCallback) => {
  let data: any = await promiseWrap(baseUrl);

  if (data.Code === 0) {
    callback(data.Data);
  } else {
    console.log('API request error.');
    console.log('requestAsync data: ', data);
  }
};

export const requestListAsync = async (dataId: number, callback: requestAsyncCallback) => {
  let data: any = await promiseWrap(`${ baseUrl }Info?id=${ dataId }`);

  if (data.Code === 0) {
    callback(data.Data);
  } else {
    console.log('API request error.');
    console.log('requestAsync data: ', data);
  }
};

// export default {
//   requestTypeAsync
// }
