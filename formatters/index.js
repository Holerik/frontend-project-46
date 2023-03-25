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
  switch (style) {
    case 'plain':
      return formatter.plain(data);
    case 'stylish':
      return formatter.stylish(data);
    case 'json':
      return formatter.json(data, file1, file2);
    default:
      return formatter.stylish(data);
  }
}

export default format;
