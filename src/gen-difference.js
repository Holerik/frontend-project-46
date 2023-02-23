// getDifference.js
import fs from 'node:fs';
import _ from 'lodash';
import { fileURLToPath } from 'url';
import path, { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FILE_JSON = 'json';

const getFilePath = (fname) => path.join(__dirname, '..', fname);

const genDifferenceString = (buf1, buf2) => {
  const keys1 = Object.keys(buf1);
  const keys2 = Object.keys(buf2);
  // ключи, отсутствующие в 1 файле идут с +
  const diff21 = _.difference(keys2, keys1);
  // ключи, отсутствующие во 2 файле идут с -
  const diff12 = _.difference(keys1, keys2);
  const arr = [];
  diff12.forEach(key => arr.push([`- ${key}`, buf1[key]]));
  diff21.forEach(key => arr.push([`+ ${key}`, buf2[key]]));
  const inters = _.intersection(keys1, keys2);
  inters.forEach(key => {
    if (buf1[key] === buf2[key]) {
      arr.push([`  ${key}`, buf1[key]]);
    } else {
      arr.push([`- ${key}`, buf1[key]]);
      arr.push([`+ ${key}`, buf2[key]]);
    }
  });
  const sortedArr = _.sortBy(arr, (item) => item[0].charCodeAt(2));
  // arr.sort((item1, item2) => item1[0].charCodeAt(2) - item2[0].charCodeAt(2));
  let diff = '{\r\n';
  sortedArr.forEach(item => {
    diff += `  ${item[0]}: ${item[1]}\r\n`;
  });
  diff += '}\r\n';
  return diff;
};

const processFile = (fname) => {
  if (fs.existsSync(fname)) {
    return fs.openSync(fname, 'r');
  };
  return 0;
};

const getJSONObject = (file) => {
  let fd = 0;
  const jsonObj = {
    res: 'unknown error!'
  }
  if (!file.endsWith(FILE_JSON)) {
    file += `.${FILE_JSON}`;
  }
  fd = processFile(getFilePath(file));
  if (fd !== 0) {
    jsonObj.buffer = JSON.parse(fs.readFileSync(fd));
    jsonObj.res = '';
    fs.closeSync(fd);
  } else {
    jsonObj.res = `file ${file} is not exists`;
  }
  return jsonObj;
};

export default (file1, file2) => {
  const jsonObj1 = getJSONObject(file1);
  const jsonObj2 = getJSONObject(file2);
  if (jsonObj1.res === '' && jsonObj2.res === '') {
    return genDifferenceString(jsonObj1.buffer, jsonObj2.buffer);
  }
  return jsonObj1.res.length > 0 ? jsonObj1.res : jsonObj2.res;
};
