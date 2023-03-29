// parser.js
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFilePath = (fname) => path.join(__dirname, '..', fname);
const getFixturePath = (fname) => path.join(__dirname, '..', '__fixtures__', fname);

const openFile = (fname) => {
  if (fs.existsSync(fname)) {
    return fs.openSync(fname);
  }
  return 0;
};

const tryOpenFile = (fname) => {
  const fd = openFile(fname);
  if (fd === 0) {
    const fd1 = openFile(getFilePath(fname));
    if (fd1 === 0) {
      const fd2 = openFile(getFixturePath(fname));
      return fd2;
    }
    return fd1;
  }
  return fd;
};

const parser = {
  json: (data) => JSON.parse(data),
  yml: (data) => yaml.load(data),
};

export default (type, file) => {
  if (Object.hasOwn(parser, type)) {
    const fd = tryOpenFile(file);
    if (fd !== 0) {
      const obj = {
        buffer: parser[type](fs.readFileSync(fd), { encoding: 'utf8', flag: 'r' }),
        res: '',
      };
      fs.closeSync(fd);
      return obj;
    }
    return {
      buffer: '',
      res: `file ${file}: open error`,
    };
  }
  return {
    buffer: '',
    res: `error: no parser for file type ${type}`,
  };
};

export { getFilePath };
