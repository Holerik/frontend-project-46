// get-difference.js
// Функции для получения результатов сравнения
// двух файлов данных в форматах JSON и YAML

import _ from 'lodash';
import fp from 'lodash/fp.js';
import path from 'node:path';
import parseFile from './parser.js';
import formatter from '../formatters/index.js';

const createEnum = () => {
  const enumObject = {
    BOTH: 'BOTH',
    FIRST: 'FIRST',
    SECOND: 'SECOND',
    NONE: 'NONE',
  };
  return Object.freeze(enumObject);
};

const OBJ_IDENT = '#__';
const OBJ_ROOT = 'root';
const flags = createEnum();

const getElem = (obj, data, level, flag, key) => {
  if (obj[key] !== null && typeof obj[key] === 'object') {
    const data1 = [OBJ_IDENT + data[1], key, level, flag];
    // eslint-disable-next-line no-use-before-define
    return fp.concat(data1)([genData(obj[key], data1, level + 1, flag)]);
  }
  return [key, obj[key]];
};

const createData = (obj, data, level, flag, index, res) => {
  const keys = Object.keys(obj);
  if (keys.length === index) {
    return res;
  }
  return createData(
    obj,
    data,
    level,
    flag,
    index + 1,
    fp.concat(res)([getElem(obj, data, level, flag, keys[index])]),
  );
};

// Преобразование содержимого объекта в структуру для дальнейшей обработки
const genData = (
  obj,
  data,
  level = 0,
  flag = flags.FIRST,
) => createData(obj, data, level, flag, 0, []);

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

const getDiffArr = (keys, flag, predicat, buffer, index, arr) => {
  if (index === keys.length) {
    return arr;
  }
  return getDiffArr(
    keys,
    flag,
    predicat,
    buffer,
    index + 1,
    fp.concat(arr)([[`${flag === flags.BOTH ? predicat : ' '} ${keys[index]}`, buffer[keys[index]]]]),
  );
};

const getIntersElement = (buf1, buf2, key) => {
  if (buf1[key] === buf2[key]) {
    return [[`  ${key}`, buf1[key]]];
  }
  return [[`- ${key}`, buf1[key]], [`+ ${key}`, buf2[key]]];
};

const addIntersElements = (keys, buf1, buf2, index, arr) => {
  if (index === keys.length) {
    return arr;
  }
  return addIntersElements(
    keys,
    buf1,
    buf2,
    index + 1,
    fp.concat(arr)(getIntersElement(buf1, buf2, keys[index])),
  );
};

// Массив полей, содержащий результаты сравнения полей простых объектов
const genDifferenceArray = (buf1, buf2, flag) => {
  const keys1 = Object.keys(buf1);
  const keys2 = Object.keys(buf2);
  // ключи, отсутствующие в 1 файле идут с +
  const diff21 = _.difference(keys2, keys1);
  // ключи, отсутствующие во 2 файле идут с -
  const diff12 = _.difference(keys1, keys2);
  const arr = _.concat(
    getDiffArr(diff12, flag, '-', buf1, 0, []),
    getDiffArr(diff21, flag, '+', buf2, 0, []),
  );
  const inters = _.intersection(keys1, keys2);
  return addIntersElements(inters, buf1, buf2, 0, arr);
};

const concatItems = (items, level, res = '', index = 0) => {
  if (index === items.length) {
    return res;
  }
  const item = items[index];
  const str = item[1] === '' ? `${item[0]}: \n`
    : `${_.trimEnd(`${item[0]}: ${item[1]}`, ' ')}\n`;
  return concatItems(
    items,
    level,
    `${res}${str.padStart(str.length + 4 * level + 2, ' ')}`,
    index + 1,
  );
};

// Строки, полученные из массива полей
const genDifferenceString = (buf1, buf2, level, flag) => {
  const arr = genDifferenceArray(buf1, buf2, flag);
  return concatItems(arr, level);
};

// получаем родительский объект с новым флагом
const getItemValue = (item, key, flag) => {
  if (key < 3) {
    return item[key];
  }
  if (key === 3) {
    return flag;
  }
  return _.cloneDeep(item[4]);
};

// меняем флаг только у родительского объекта
// цикл по ключам родительского объекта
const getItemWhithNewFlag = (oldItem, newItem, key, flag) => {
  if (key === 5) {
    return newItem;
  }
  return getItemWhithNewFlag(
    oldItem,
    fp.concat(newItem)([getItemValue(oldItem, key, flag)]),
    key + 1,
    flag,
  );
};

// получаем родительский объект и все дочерние с новым флагом
const getItemValue1 = (item, key, flag) => {
  if (key < 3) {
    return item[key];
  }
  if (key === 3) {
    return flag;
  }
  // eslint-disable-next-line no-use-before-define
  return getAllItemValues(item[4], [], 0, flag);
};

// цикл по описаниям 'ключ: значние' родительского объекта
const getAllItemValues = (oldItem, item, key, flag) => {
  if (oldItem.length === key) {
    return item;
  }
  const subItem = checkItem(oldItem[key])
    // eslint-disable-next-line no-use-before-define
    ? [getAllSubItemsWhithNewFlag(oldItem[key], [], 0, flag)] : [_.clone(oldItem[key])];
  return getAllItemValues(oldItem, fp.concat(item)(subItem), key + 1, flag);
};

// меняем флаг у родительского объекта и всех дочерних, если такие есть
// цикл по ключам родительского объекта
const getAllSubItemsWhithNewFlag = (oldItem, newItem, key, flag) => {
  if (key === 5) {
    return newItem;
  }
  return getAllSubItemsWhithNewFlag(
    oldItem,
    fp.concat(newItem)([getItemValue1(oldItem, key, flag)]),
    key + 1,
    flag,
  );
};

// Получение результатов сравнения даанных
// в неотсортированном виде
const genDifference = (data1, data2) => {
  // списки объектов
  const objs1 = data1[4].filter((item) => checkItem(item));
  const objs2 = data2[4].filter((item) => checkItem(item));
  // списки пара 'ключ: значение'
  const obj1 = _.fromPairs(data1[4].filter((item) => !checkItem(item)));
  const obj2 = _.fromPairs(data2[4].filter((item) => !checkItem(item)));
  const str1 = [genDifferenceString(obj1, obj2, data1[2], data1[3])];
  objs1.forEach((item) => {
    const obj = selectData(data2, item[1], item[0]);
    if (obj[0] !== OBJ_IDENT) {
      const newItem = getItemWhithNewFlag(item, [], 0, flags.BOTH);
      const newObj = getItemWhithNewFlag(obj, [], 0, flags.BOTH);
      str1.push(genDifference(newItem, newObj));
    } else if (item[3] === flags.FIRST) {
      const newItem1 = getAllSubItemsWhithNewFlag(item, [], 0, flags.NONE);
      const newItem = getItemWhithNewFlag(newItem1, [], 0, flags.FIRST);
      str1.push(genDifference(newItem, obj));
    } else {
      str1.push(genDifference(item, obj));
    }
  });
  objs2.forEach((item) => {
    const obj = selectData(data1, item[1], item[0]);
    if (obj[0] === OBJ_IDENT) {
      const newItem1 = getAllSubItemsWhithNewFlag(item, [], 0, flags.NONE);
      const newItem = getItemWhithNewFlag(newItem1, [], 0, flags.SECOND);
      str1.push(genDifference(newItem, obj));
    }
  });

  const res = (data) => {
    const start = '{\n';
    const mod = {
      [flags.NONE]: '',
      [flags.BOTH]: '',
      [flags.FIRST]: '-',
      [flags.SECOND]: '+',
    };
    if (data[1] === OBJ_ROOT) {
      return [start.padStart(start.length + 2 * data[2], ' ')];
    }
    const temp = Object.keys(objs2).length === 0 ? `${mod[data[3]]} ${data[1]}` : data[1];
    return [`${temp.padStart(data1[1].length + 4 * data1[2], ' ')}: ${start}`];
  };

  const fin = `${data1[1] !== OBJ_ROOT ? '  ' : ''}}\n`;
  const out = fp.concat(res(data1).concat(str1))(fin.padStart(fin.length + 4 * data1[2] - 2, ' '));
  return out.join('');
};

export default (file1, file2, style) => {
  const ext1 = path.extname(file1).slice(1);
  const ext2 = path.extname(file2).slice(1);
  if (ext1 === ext2) {
    const obj1 = parseFile(ext1, file1);
    const obj2 = parseFile(ext2, file2);
    if (obj1.res === '' && obj2.res === '') {
      const firstItem = [OBJ_IDENT, OBJ_ROOT, 0, flags.BOTH];
      const data1 = fp.concat(firstItem)([genData(obj1.buffer, firstItem, 1, flags.FIRST)]);
      const data2 = fp.concat(firstItem)([genData(obj2.buffer, firstItem, 1, flags.SECOND)]);
      return formatter(genDifference(data1, data2), file1, file2, style);
    }
    return obj1.res.length > 0 ? obj1.res : obj2.res;
  }
  return 'error: mixed file types';
};
