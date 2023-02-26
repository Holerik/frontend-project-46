// getDifference.js
import _ from 'lodash';
import path from 'node:path';
import parseFile from './parser.js';

const genDifferenceString = (buf1, buf2) => {
  const keys1 = Object.keys(buf1);
  const keys2 = Object.keys(buf2);
  // ключи, отсутствующие в 1 файле идут с +
  const diff21 = _.difference(keys2, keys1);
  // ключи, отсутствующие во 2 файле идут с -
  const diff12 = _.difference(keys1, keys2);
  const arr = [];
  diff12.forEach((key) => arr.push([`- ${key}`, buf1[key]]));
  diff21.forEach((key) => arr.push([`+ ${key}`, buf2[key]]));
  const inters = _.intersection(keys1, keys2);
  inters.forEach((key) => {
    if (buf1[key] === buf2[key]) {
      arr.push([`  ${key}`, buf1[key]]);
    } else {
      arr.push([`- ${key}`, buf1[key]]);
      arr.push([`+ ${key}`, buf2[key]]);
    }
  });
  const sortedArr = _.sortBy(arr, (item) => item[0].charCodeAt(2));
  // arr.sort((item1, item2) => item1[0].charCodeAt(2) - item2[0].charCodeAt(2));
  let diff = '{\n';
  sortedArr.forEach((item) => {
    diff += `  ${item[0]}: ${item[1]}\n`;
  });
  diff += '}\n';
  return diff;
};

export default (file1, file2) => {
  let strOut = 'error: mixed file types';
  const ext1 = path.extname(file1).slice(1);
  const ext2 = path.extname(file2).slice(1);
  if (ext1 === ext2) {
    const obj1 = parseFile(ext1, file1);
    const obj2 = parseFile(ext2, file2);
    if (obj1.res === '' && obj2.res === '') {
      strOut = genDifferenceString(obj1.buffer, obj2.buffer);
    } else {
      strOut = obj1.res.length > 0 ? obj1.res : obj2.res;
    }
  }
  return strOut;
};
