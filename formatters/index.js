// index.js
// Выбор форматтера

import plain from './plain.js';
import stylish from './stylish.js';
import json from './json.js';

const formatter = {
  plain: (data) => plain(data),
  stylish: (data) => stylish(data),
  json: (data, f1, f2) => json(stylish(data), plain(data), f1, f2),
};

function format(data, file1, file2, style = 'stylish') {
  let res = data;
  switch (style) {
    case 'plain':
      res = formatter.plain(data);
      break;
    case 'stylish':
      res = formatter.stylish(data);
      break;
    case 'json':
      res = formatter.json(data, file1, file2);
      break;
    default:
      res = formatter.plain(data);
      break;
  }
  return res;
}

export default format;
