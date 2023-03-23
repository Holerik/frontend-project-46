// get-sorted.js
// Функции для обработки результатов сравнения и
// представления их в отсортированном виде

// Выделение имени свойста из строки
const getPropName = (str) => {
  const semiColInd = str.indexOf(':');
  if (semiColInd < 0) {
    return '';
  }
  let blankInd = semiColInd - 1;
  while (str[blankInd] !== ' ') {
    blankInd -= 1;
  }
  return str.slice(blankInd + 1, semiColInd);
};

// Определение индекса строки для следующего свойства,
// если текущее свойство оказалось объектом
const skipInternalObjectProps = (content, pos) => {
  let ind = pos;
  let counter = 0;
  do {
    if (content[ind].includes('{')) {
      counter += 1;
    } else if (content[ind].includes('}')) {
      counter -= 1;
    }
  // eslint-disable-next-line no-plusplus
  } while (counter > 0 && ind++);
  return ind;
};

// Получение списка свойств объектов в отсортированном виде
const getSortedObjKeys = (strArr, pos) => {
  const keys = [];
  for (let ind = pos + 1; ind < strArr.length - 1; ind += 1) {
    const propName = getPropName(strArr[ind]);
    if (propName.length > 0) {
      keys.push([propName, ind, pos]);
    }
    if (strArr[ind].includes('{')) {
      ind = skipInternalObjectProps(strArr, ind);
    } else if (strArr[ind].includes('}')) {
      break;
    }
  }
  return keys.sort(
    (item1, item2) => {
      if (item1[0] === item2[0]) {
        const v1 = strArr[item1[1]].includes('-') ? -1 : 0;
        const v2 = strArr[item2[1]].includes('-') ? 1 : 0;
        return v1 + v2;
      }
      return item1[0].localeCompare(item2[0]);
    },
  );
};

// Выделение объекта с подобъектами по его имени
const getObjValue = (strArr, key) => {
  const ind = key[1];
  const str = strArr[ind];
  let res = `${str}\n`;
  if (str.includes('{')) {
    const keys = getSortedObjKeys(strArr, ind);
    const blanks = str.lastIndexOf(' ', str.length - 3);
    // eslint-disable-next-line no-use-before-define
    res += getAssemblyObject(strArr, keys);
    res += '}\n'.padStart(blanks + 3);
  }
  return res;
};

// Сборка объекта
const getAssemblyObject = (strArr, keys) => {
  let ass = '';
  keys.forEach((key) => {
    ass += getObjValue(strArr, key);
  });
  return ass;
};

export default (source) => {
  const strArr = source.split('\n');
  const keys = getSortedObjKeys(strArr, 0);
  const str = getAssemblyObject(strArr, keys);
  return `{\n${str}}`;
};

export { getSortedObjKeys, getObjValue, getPropName };
