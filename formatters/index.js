// index.js
// Выбор форматтера

import plain from './plain.js';
import stylish from './stylish.js';

const formatter = {
  plain: (data) => plain(data),
  stylish: (data) => stylish(data),
};

function format(data, style = 'stylish') {
  let res = data;
  switch (style) {
    case 'plain':
      res = formatter.plain(data);
      break;
    case 'stylish':
      res = formatter.stylish(data);
      break;
    default:
      res = formatter.plain(data);
      break;
  }
  return res;
}

export default format;
