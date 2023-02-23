// gendiff.test.js
import gendiff from '../src/gen-difference.js';
import path, { dirname } from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) =>
  path.join(__dirname, '..', '__fixtures__', filename);

const readFixture = (filename) => fs.readFileSync(
  getFixturePath(filename),
  { encoding: 'utf8',
    flag: 'r'
});

test('gendiff fixture test', () => {
  const diff = gendiff('file1', 'file2');
  const fixDiff = readFixture('gendiff.fix');
  expect(diff).toEqual(fixDiff);
});
