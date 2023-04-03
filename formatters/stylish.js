// stylish.js
// Функции для обработки результатов сравнения и
// представления их в структурированном и отсортированном виде

import fp from 'lodash/fp.js';

// Выделение имени свойста или объекта из строки
const getPropName = (str) => {
  const semiColInd = str.indexOf(':');
  const blankInd = str.lastIndexOf(' ', semiColInd - 1);
  return str.slice(blankInd + 1, semiColInd);
};

// Определение индекса строки для следующего свойства,
// если текущее свойство оказалось объектом
const skipInternalObjectProps = (strArr, counter, pos, flag = false) => {
  if (counter === 0 && flag) {
    return pos - 1;
  }
  if (strArr[pos].includes('{')) {
    return skipInternalObjectProps(strArr, counter + 1, pos + 1, true);
  }
  if (counter > 0 && strArr[pos].includes('}')) {
    return skipInternalObjectProps(strArr, counter - 1, pos + 1, true);
  }
  return skipInternalObjectProps(strArr, counter, pos + 1, true);
};

const getSorted = (strArr, array) => fp.cloneDeep(array).sort(
  (item1, item2) => {
    if (item1[0] === item2[0]) {
      const v1 = strArr[item1[1]].includes('-') ? -1 : 0;
      const v2 = strArr[item2[1]].includes('+') ? 0 : 1;
      return v1 + v2;
    }
    return item1[0].localeCompare(item2[0]);
  },
);

// получение ключей свойств объекта, описание которого
// содержится в массиве strArr, начиная с позиции startPos
const getSortedObjKeys = (strArr, startPos, pos = 0) => {
  const keys = fp.concat([])([[getPropName(strArr[startPos + 1]), startPos + 1, pos]]);
  const finalPos = skipInternalObjectProps(strArr, 0, startPos + 1, false);
  if (!strArr[finalPos + 1].includes('}')) {
    return getSorted(strArr, fp.concat(keys)(getSortedObjKeys(strArr, finalPos, pos)));
  }
  return getSorted(strArr, keys);
};

// Выделение объекта с подобъектами по его имени
const getObjValue = (strArr, key) => {
  const ind = key[1];
  const str = strArr[ind];
  const res = `${str}\n`;
  if (str.includes('{')) {
    const keys = getSortedObjKeys(strArr, ind, ind);
    const blanks = str.lastIndexOf(' ', str.length - 3);
    // eslint-disable-next-line no-use-before-define
    return `${res}${getAssemblyObject(strArr, keys)}${'}\n'.padStart(blanks + 3)}`;
  }
  return res;
};

const sumKeys = (strArr, sum, keys, index) => {
  if (index === keys.length) {
    return sum;
  }
  const key = keys[index];
  return sumKeys(strArr, `${sum}${getObjValue(strArr, key)}`, keys, index + 1);
};

// Сборка объекта
const getAssemblyObject = (strArr, keys) => sumKeys(strArr, '', keys, 0);

export default (source) => {
  const strArr = source.split('\n');
  const keys = getSortedObjKeys(strArr, 0);
  const str = getAssemblyObject(strArr, keys);
  // без последнего символа конца строки
  // будет добавлен в gendiff.js
  return `{\n${str}}`;
};

export { getSortedObjKeys, getObjValue, getPropName };
