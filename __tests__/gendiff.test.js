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

const genDiff = (f1, f2, style) => `${compare(f1, f2, style)}\n`;

describe('test plain data whith stylish formatter', () => {
  test('gendiff json test', () => {
    const diff = genDiff('file1.json', 'file2.json', 'stylish');
    const fixDiff = readFixture('gendiff.fix');
    expect(diff).toEqual(fixDiff);
  });

  test('gendiff yaml test', () => {
    const diff = genDiff('file1.yml', 'file2.yml', 'stylish');
    const fixDiff = readFixture('gendiff.fix');
    expect(diff).toEqual(fixDiff);
  });
});

describe('test structured data whith wrong formatter', () => {
  test('gendiff json test', () => {
    const diff = genDiff('file1.json', 'file2.json', 'unknown');
    const fixDiff = readFixture('gendiff.fix');
    expect(diff).toEqual(fixDiff);
  });
});

describe('test wrong data', () => {
  test('gendiff mixed file test', () => {
    const diff = genDiff('file1.json', 'file2.yml', 'stylish');
    expect(diff).toEqual('error: mixed file types\n');
  });

  test('gendiff no file test', () => {
    const diff = genDiff('file1.json', 'file13.json', 'stylish');
    expect(diff).toEqual('file file13.json: open error\n');
  });

  test('gendiff no parser test', () => {
    const diff = genDiff('file1.xml', 'file3.xml', 'stylish');
    expect(diff).toEqual('error: no parser for file type xml\n');
  });
});

describe('test structured data whith stylish formatter', () => {
  test('gendiff complex json test', () => {
    const diff = genDiff('file3.json', 'file4.json', 'stylish');
    const fixDiff = readFixture('compldiff.fix');
    // eslint-disable-next-line jest/no-standalone-expect
    expect(diff).toEqual(fixDiff);
  });

  test('gendiff complex yaml test', () => {
    const diff = genDiff('file3.yml', 'file4.yml', 'stylish');
    const fixDiff = readFixture('compldiff.fix');
    // eslint-disable-next-line jest/no-standalone-expect
    expect(diff).toEqual(fixDiff);
  });
});

describe('test structured data whith plain formatter', () => {
  test('gendiff json test', () => {
    const diff = genDiff('file3.json', 'file4.json', 'plain');
    const fixDiff = readFixture('plain.fix');
    expect(diff).toEqual(fixDiff);
  });

  test('gendiff yaml test', () => {
    const diff = genDiff('file3.yml', 'file4.yml', 'plain');
    const fixDiff = readFixture('plain.fix');
    expect(diff).toEqual(fixDiff);
  });

  test('gendiff json test with another data', () => {
    const diff = genDiff('file1.json', 'file2.json', 'plain');
    const fixDiff = readFixture('genplain.fix');
    expect(diff).toEqual(fixDiff);
  });
});

describe('test plain data whith json formatter', () => {
  test('gendiff json stylish test', () => {
    const json = JSON.parse(genDiff('file1.json', 'file2.json', 'json'));
    const stylishDiff = readFixture('gendiff.fix');
    expect(json.stylish).toEqual(stylishDiff.slice(0, stylishDiff.length - 1));
  });

  test('gendiff json contains file info', () => {
    const json = JSON.parse(genDiff('file1.json', 'file2.json', 'json'));
    expect(json.filePath1).toEqual(expect.stringContaining('file1.json'));
    expect(json.filePath2).toEqual(expect.stringContaining('file2.json'));
  });
});

describe('test structured data whith json formatter', () => {
  test('gendiff json plain test', () => {
    const json = JSON.parse(genDiff('file3.json', 'file4.json', 'json'));
    const plainDiff = readFixture('plain.fix');
    expect(json.plain).toEqual(plainDiff.slice(0, plainDiff.length - 1));
  });

  test('gendiff json stylish test', () => {
    const json = JSON.parse(genDiff('file3.json', 'file4.json', 'json'));
    const stylishDiff = readFixture('compldiff.fix');
    expect(json.stylish).toEqual(stylishDiff.slice(0, stylishDiff.length - 1));
  });

  test('gendiff json contains file info', () => {
    const json = JSON.parse(genDiff('file3.json', 'file4.json', 'json'));
    expect(json.filePath1).toEqual(expect.stringContaining('file3.json'));
    expect(json.filePath2).toEqual(expect.stringContaining('file4.json'));
  });
});
