// gendiff.test.js
import path, { dirname } from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import gendiff from '../src/gen-difference.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(
  __dirname,
  '..',
  '__fixtures__',
  filename,
);

const readFixture = (filename) => fs.readFileSync(
  getFixturePath(filename),
  {
    encoding: 'utf8',
    flag: 'r',
  },
);

test('gendiff json test', () => {
  const diff = gendiff('file1.json', 'file2.json');
  const fixDiff = readFixture('gendiff.fix');
  expect(diff).toEqual(fixDiff);
});

test('gendiff yaml test', () => {
  const diff = gendiff('file1.yml', 'file2.yml');
  const fixDiff = readFixture('gendiff.fix');
  expect(diff).toEqual(fixDiff);
});

test('gendiff mixed file test', () => {
  const diff = gendiff('file1.json', 'file2.yml');
  expect(diff).toEqual('error: mixed file types');
});

test('gendiff no file test', () => {
  const diff = gendiff('file1.json', 'file3.json');
  expect(diff).toEqual('file file3.json: open error');
});

test('gendiff no parser test', () => {
  const diff = gendiff('file1.xml', 'file3.xml');
  expect(diff).toEqual('error: no parser for file type xml');
});
