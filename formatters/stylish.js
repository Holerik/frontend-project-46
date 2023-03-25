// stylish.js
// Функции для обработки результатов сравнения и
// представления их в структурированном и отсортированном виде

// Выделение имени свойста или объекта из строки
const getPropName = (str) => {
  const semiColInd = str.indexOf(':');
  const blankInd = str.lastIndexOf(' ', semiColInd - 1);
  return str.slice(blankInd + 1, semiColInd);
};

// Определение индекса строки для следующего свойства,
// если текущее свойство оказалось объектом
const skipInternalObjectProps = (content, pos) => {
  const temp = {
    ind: pos,
    counter: 0,
  };
  do {
    if (content[temp.ind].includes('{')) {
      temp.counter += 1;
    } else if (content[temp.ind].includes('}')) {
      temp.counter -= 1;
    }
  // eslint-disable-next-line no-plusplus
  } while (temp.counter > 0 && temp.ind++);
  return temp.ind;
};

// получение ключей свойств объекта, описание которого
// содержится в массиве strArr, начиная с позиции startPos
const getSortedObjKeys = (strArr, startPos, pos = 0) => {
  const keys = [];
  keys.push([getPropName(strArr[startPos + 1]), startPos + 1, pos]);
  const finalPos = skipInternalObjectProps(strArr, startPos + 1);
  if (!strArr[finalPos + 1].includes('}')) {
    const keys1 = getSortedObjKeys(strArr, finalPos, pos);
    keys1.forEach((key) => keys.push(key));
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
  const out = { res: `${str}\n` };
  if (str.includes('{')) {
    const keys = getSortedObjKeys(strArr, ind, ind);
    const blanks = str.lastIndexOf(' ', str.length - 3);
    // eslint-disable-next-line no-use-before-define
    out.res += getAssemblyObject(strArr, keys);
    out.res += '}\n'.padStart(blanks + 3);
  }
  return out.res;
};

// Сборка объекта
const getAssemblyObject = (strArr, keys) => {
  const out = { ass: '' };
  keys.forEach((key) => {
    out.ass += getObjValue(strArr, key);
  });
  return out.ass;
};

export default (source) => {
  const strArr = source.split('\n');
  const keys = getSortedObjKeys(strArr, 0);
  const str = getAssemblyObject(strArr, keys);
  // без последнего символа конца строки
  // будет добавлен в gendiff.js
  return `{\n${str}}`;
};

export { getSortedObjKeys, getObjValue, getPropName };
