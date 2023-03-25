// get-difference.js
// Функции для получения результатов сравнения
// двух файлов данных в форматах JSON и YAML

import _ from 'lodash';
import path from 'node:path';
import parseFile from './parser.js';
import formatter from '../formatters/index.js';

const createEnum = (values) => {
  const enumObject = {};
  // eslint-disable-next-line no-return-assign
  values.forEach((val) => enumObject[val] = Symbol(val));
  return Object.freeze(enumObject);
};

const OBJ_IDENT = '#__';
const OBJ_ROOT = 'root';
const flags = createEnum(['BOTH', 'FIRST', 'SECOND', 'NONE']);

// Преобразование содержимого объекта в структуру для дальнейшей обработки
const genData = (obj, data, level = 0, flag = flags.FIRST) => {
  const keys = Object.keys(obj);
  const values = [];
  keys.forEach((key) => {
    if (obj[key] !== null && typeof obj[key] === 'object') {
      const data1 = [OBJ_IDENT + data[1], key, level, flag];
      values.push(data1);
      data1.push(genData(obj[key], data1, level + 1, flag));
    } else {
      values.push([key, obj[key]]);
    }
  });
  return values;
};

// Элемент структуры содержит свойства объекта
const checkItem = (item) => (typeof item[0] === 'string') && item[0].includes(OBJ_IDENT);

// Поиск данных объекта по ключам
const selectData = (data, objKey, parentKey) => {
  if (objKey === data[1] && data[0].includes(parentKey)) {
    return data;
  }
  const objs = data[4].filter((item) => checkItem(item));
  const index = objs.findIndex((obj) => {
    const info = selectData(obj, objKey, parentKey);
    return objKey === info[1] && info[0].includes(parentKey);
  });
  if (index === -1) {
    // Данные не найдены
    return [OBJ_IDENT, '', 0, flags.FIRST, []];
  }
  return objs[index];
};

const setAllSubItems = (obj, flag) => {
  const items = obj[4].filter((item) => checkItem(item));
  items.forEach((item) => {
    // eslint-disable-next-line no-param-reassign
    item[3] = flag;
    setAllSubItems(item, flag);
  });
};

const getDiffArr = (keys, flag, predicat, buffer) => {
  const arr = [];
  keys.forEach((key) => {
    arr.push([`${flag === flags.BOTH ? predicat : ' '} ${key}`, buffer[key]]);
  });
  return arr;
};

// Массив полей, содержащий результаты сравнения полей простых объектов
const genDifferenceArray = (buf1, buf2, level, flag) => {
  const keys1 = Object.keys(buf1);
  const keys2 = Object.keys(buf2);
  // ключи, отсутствующие в 1 файле идут с +
  const diff21 = _.difference(keys2, keys1);
  // ключи, отсутствующие во 2 файле идут с -
  const diff12 = _.difference(keys1, keys2);
  const arr = _.concat(getDiffArr(diff12, flag, '-', buf1), getDiffArr(diff21, flag, '+', buf2));
  const inters = _.intersection(keys1, keys2);
  inters.forEach((key) => {
    if (buf1[key] === buf2[key]) {
      arr.push([`  ${key}`, buf1[key]]);
    } else {
      arr.push([`- ${key}`, buf1[key]]);
      arr.push([`+ ${key}`, buf2[key]]);
    }
  });
  return arr;
};

// Строки, полученные из массива полей
const genDifferenceString = (buf1, buf2, level, flag) => {
  const arr = genDifferenceArray(buf1, buf2, level, flag);
  const info = { diff: '' };
  arr.forEach((item) => {
    const str = item[1] === '' ? `${item[0]}: \n`
      : `${_.trimEnd(`${item[0]}: ${item[1]}`, ' ')}\n`;
    info.diff += str.padStart(str.length + 4 * level + 2, ' ');
  });
  return info.diff;
};

// Получение результатов сравнения даанных
// в неотсортированном виде
const genDifference = (data1, data2) => {
  const objs1 = data1[4].filter((item) => checkItem(item));
  const objs2 = data2[4].filter((item) => checkItem(item));
  const obj1 = _.fromPairs(data1[4].filter((item) => !checkItem(item)));
  const obj2 = _.fromPairs(data2[4].filter((item) => !checkItem(item)));
  const str1 = [];
  str1.push(genDifferenceString(obj1, obj2, data1[2], data1[3]));
  objs1.forEach((item) => {
    const obj = selectData(data2, item[1], item[0]);
    if (obj[0] !== OBJ_IDENT) {
      // eslint-disable-next-line no-param-reassign
      item[3] = flags.BOTH;
      obj[3] = flags.BOTH;
    } else if (item[3] === flags.FIRST) {
      setAllSubItems(item, flags.NONE);
    }
    str1.push(genDifference(item, obj));
  });
  objs2.forEach((item) => {
    const obj = selectData(data1, item[1], item[0]);
    if (obj[0] === OBJ_IDENT) {
      // eslint-disable-next-line no-param-reassign
      item[3] = flags.SECOND;
      setAllSubItems(item, flags.NONE);
      str1.push(genDifference(item, obj));
    }
  });
  const start = '{\n';
  const res1 = [start.padStart(start.length + 2 * data1[2], ' ')];
  if (data1[1] !== OBJ_ROOT) {
    const mod = {
      [flags.NONE]: '',
      [flags.BOTH]: '',
      [flags.FIRST]: '-',
      [flags.SECOND]: '+',
    };
    const temp = Object.keys(objs2).length === 0 ? `${mod[data1[3]]} ${data1[1]}` : data1[1];
    res1.pop();
    res1.push(`${temp.padStart(data1[1].length + 4 * data1[2], ' ')}: ${start}`);
  }
  const out = res1.concat(str1);
  const fin = `${data1[1] !== OBJ_ROOT ? '  ' : ''}}\n`;
  out.push(fin.padStart(fin.length + 4 * data1[2] - 2, ' '));
  return out.join('');
};

export default (file1, file2, style) => {
  const ext1 = path.extname(file1).slice(1);
  const ext2 = path.extname(file2).slice(1);
  if (ext1 === ext2) {
    const obj1 = parseFile(ext1, file1);
    const obj2 = parseFile(ext2, file2);
    if (obj1.res === '' && obj2.res === '') {
      const data1 = [OBJ_IDENT, OBJ_ROOT, 0, flags.BOTH];
      const data2 = [OBJ_IDENT, OBJ_ROOT, 0, flags.DOTH];
      data1.push(genData(obj1.buffer, data1, 1, flags.FIRST));
      data2.push(genData(obj2.buffer, data2, 1, flags.SECOND));
      return formatter(genDifference(data1, data2), file1, file2, style);
    }
    return obj1.res.length > 0 ? obj1.res : obj2.res;
  }
  return 'error: mixed file types';
};
