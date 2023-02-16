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

const genDifference = (file1, file2) => {
  let res = 'unknown error!';
  const cwd = process.cwd();
  let fd1 = 0;
  let fd2 = 0;
  if (!file1.endsWith(FILE_JSON)) {
    file1 += `.${FILE_JSON}`;
  }
  if (!file2.endsWith(FILE_JSON)) {
    file2 += `.${FILE_JSON}`;
  }
  let fname1 = path.resolve(file1);
  let fname2 = path.resolve(file2);
  if (fs.existsSync(fname1)) {
    fd1 = fs.openSync(fname1, 'r');
  } else {
    const fInfo = path.parse(file1);
    fname1 = `${cwd}/${fInfo.base}`;
    if (fs.existsSync(fname1)) {
      fd1 = fs.openSync(fname1, 'r');
    } else {
      res = `file ${file1} is not exists`;
    }
  }
  if (fs.existsSync(fname2)) {
    fd2 = fs.openSync(fname2, 'r');
  } else {
    const fInfo = path.parse(file2);
    fname2 = `${cwd}/${fInfo.base}`;
    if (fs.existsSync(fname2)) {
      fd1 = fs.openSync(fname2, 'r');
    } else {
      res = `file ${file2} is not exists`;
    }
  }
  if (fd1 !== 0 && fd2 !== 0) {
    if (fname1.endsWith(FILE_JSON)) {
      const buffer1 = JSON.parse(fs.readFileSync(fd1));
      const buffer2 = JSON.parse(fs.readFileSync(fd2));
      res = genDifferenceString(buffer1, buffer2);
    }
  }
  if (fd1 !== 0) {
    fs.closeSync(fd1);
  }
  if (fd2 !== 0) {
    fs.closeSync(fd2);
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
