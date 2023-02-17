#!/usr/bin/env node
// gendiff.js

import { program } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import _ from 'lodash';

const FILE_JSON = 'json';

const errReport = (fname) => console.log(`file ${fname} is not exists`)

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
  let diff = '{\n';
  sortedArr.forEach(item => {
    diff += `  ${item[0]}: ${item[1]}\n`;
  });
  diff += '}\n';
  return diff;
};

const getJSONObject = (file) => {
  const cwd = process.cwd();
  let fd = 0;
  const jsonObj = {
    res: 'unknown error!'
  }
  if (!file.endsWith(FILE_JSON)) {
    file += `.${FILE_JSON}`;
  }
  let fname = path.resolve(file);
  if (fs.existsSync(fname)) {
    fd = fs.openSync(fname, 'r');
  } else {
    const fInfo = path.parse(file);
    fname = `${cwd}/${fInfo.base}`;
    if (fs.existsSync(fname)) {
      fd = fs.openSync(fname, 'r');
    } else {
      jsonObj.res = `file ${file} is not exists`;
    }
  }
  if (fd !== 0) {
    jsonObj.buffer = JSON.parse(fs.readFileSync(fd));
    jsonObj.res = '';
    fs.closeSync(fd);
  }
  return jsonObj;
}

const genDifference1 = (file1, file2) => {
  const jsonObj1 = getJSONObject(file1);
  const jsonObj2 = getJSONObject(file2);
  let res = '';
  if (jsonObj1.res === '' && jsonObj2.res === '') {
    res = genDifferenceString(jsonObj1.buffer, jsonObj2.buffer);
  } else {
    res = jsonObj1.res.length > 0 ? jsonObj1.res : jsonObj2.res;
  }
  return res;
};

const genDiff = (file1, file2) => {
  console.log(genDifference(file1, file2));
};

function compareFiles() {
  program
    .option('-h, --help', 'display help for command')
    .command('gendiff')
    .description('Compares two configuration files and shows a difference.\n')
    .version('0.0.1', '-v, --version', 'output the version number')
    .option('-f, --format <type>', 'output format')
    .arguments('<filepath1> <filepath2>')
    .action(genDiff)
    .parse(process.argv);
}

compareFiles();

export default genDifference;
