// gendiff.test.js
import path, { dirname } from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import compare from '../src/gen-difference.js';

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

describe('test plain data whith stylish formatter', () => {
  test('gendiff json test', () => {
    const diff = compare('file1.json', 'file2.json', 'stylish');
    const fixDiff = readFixture('gendiff.fix');
    expect(diff).toEqual(fixDiff);
  });

  test('gendiff yaml test', () => {
    const diff = compare('file1.yml', 'file2.yml', 'stylish');
    const fixDiff = readFixture('gendiff.fix');
    expect(diff).toEqual(fixDiff);
  });
});

describe('test structured data whith plain formatter', () => {
  test('gendiff json test', () => {
    const diff = compare('file3.json', 'file4.json', 'plain');
    const fixDiff = readFixture('plain.fix');
    expect(diff).toEqual(fixDiff);
  });

  test('gendiff yaml test', () => {
    const diff = compare('file3.yml', 'file4.yml', 'plain');
    const fixDiff = readFixture('plain.fix');
    expect(diff).toEqual(fixDiff);
  });
});

describe('test structured data whith wrong formatter', () => {
  test('gendiff json test', () => {
    const diff = compare('file3.json', 'file4.json', 'unknown');
    const fixDiff = readFixture('plain.fix');
    expect(diff).toEqual(fixDiff);
  });
});

describe('test wrong data', () => {
  test('gendiff mixed file test', () => {
    const diff = compare('file1.json', 'file2.yml', 'stylish');
    expect(diff).toEqual('error: mixed file types');
  });

  test('gendiff no file test', () => {
    const diff = compare('file1.json', 'file13.json', 'stylish');
    expect(diff).toEqual('file file13.json: open error');
  });

  test('gendiff no parser test', () => {
    const diff = compare('file1.xml', 'file3.xml', 'stylish');
    expect(diff).toEqual('error: no parser for file type xml');
  });
});

describe('test structured data', () => {
  test('gendiff complex json test', () => {
    const diff = compare('file3.json', 'file4.json', 'stylish');
    const fixDiff = readFixture('compldiff.fix');
    // eslint-disable-next-line jest/no-standalone-expect
    expect(diff).toEqual(fixDiff);
  });

  test('gendiff complex yaml test', () => {
    const diff = compare('file3.yml', 'file4.yml', 'stylish');
    const fixDiff = readFixture('compldiff.fix');
    // eslint-disable-next-line jest/no-standalone-expect
    expect(diff).toEqual(fixDiff);
  });
});
