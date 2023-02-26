// parser.js
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFilePath = (fname) => path.join(__dirname, '..', fname);

const openFile = (fname) => {
  if (fs.existsSync(fname)) {
    return fs.openSync(fname);
  }
  return 0;
};

const parser = {
  json: (data) => JSON.parse(data),
  yml: (data) => yaml.load(data),
};

export default (type, file) => {
  const obj = {};
  let fileParser;
  switch (type) {
    case 'json':
      fileParser = parser.json;
      break;
    case 'yml':
      fileParser = parser.yml;
      break;
    default:
      break;
  }
  if (fileParser) {
    const fd = openFile(getFilePath(file));
    if (fd !== 0) {
      obj.buffer = fileParser(fs.readFileSync(fd), { encoding: 'utf8', flag: 'r' });
      obj.res = '';
      fs.closeSync(fd);
    } else {
      obj.res = `file ${file}: open error`;
    }
  } else {
    obj.res = `error: no parser for file type ${type}`;
  }
  return obj;
};
