// plain.js
// Функции для обработки результатов сравнения и
// представления их в плоском стиле
import _ from 'lodash';
import { getSortedObjKeys, getObjValue, getPropName } from './stylish.js';

const TEST_CHARS = 'false|true|null';
const COMPLEX_VALUE = '[complex value]';
const PROP = 'Property';
const REMOVED = 'was removed';

const setAdded = (value) => {
  let out = 'was added with value: ';
  if (value === COMPLEX_VALUE) {
    out += COMPLEX_VALUE;
  } else {
    out += TEST_CHARS.includes(value) ? `${value}` : `'${value}'`;
  }
  return out;
};

const whithoutQuotas = (str) => TEST_CHARS.includes(str) || !_.isNaN(_.parseInt(str));

const getOut = (value) => {
  if (value.length === 0) {
    return "''";
  }
  return whithoutQuotas(value) ? `${value}` : `'${value}'`;
};

const setUpdated = (value1, value2) => {
  let out = 'was updated. From ';
  if (value1 === COMPLEX_VALUE) {
    out += COMPLEX_VALUE;
  } else {
    out += getOut(value1);
  }
  out += ' to ';
  out += getOut(value2);
  return out;
};

const getValue = (str) => {
  const length = str.indexOf('\n') > 0 ? str.length - 1 : str.length;
  return str.slice(str.indexOf(':') + 2, length);
};

const findAnotherPropValue = (strArr, key, propValue) => {
  let res = propValue;
  for (let ind = key[1] + 1; ind < strArr.length - 1; ind += 1) {
    if (strArr[ind].includes(key[0])) {
      res = getValue(strArr[ind]);
    }
  }
  if (res === propValue) {
    for (let ind = key[1] - 1; ind > 0; ind -= 1) {
      if (strArr[ind].includes(key[0])) {
        res = getValue(strArr[ind]);
      }
    }
  }
  return res.includes('{') ? '[complex value]' : res;
};

const getPropValues = (strArr, ind, parent) => {
  const keys = getSortedObjKeys(strArr, ind);
  let owner = parent;
  if (ind > 0) {
    owner = parent.length > 0 ? `${parent}.${getPropName(strArr[ind])}`
      : getPropName(strArr[ind]);
  }
  let out = '';
  keys.forEach((key) => {
    let res = getObjValue(strArr, key);
    let propValue = getValue(res);
    const propValue1 = findAnotherPropValue(strArr, key, propValue);
    if (propValue.includes('{')) {
      propValue = COMPLEX_VALUE;
      res = res.slice(0, res.indexOf(':'));
    }
    const minus = res.includes('-');
    const plus = res.includes('+');
    let comment = (owner.length > 0) ? `${owner}.${key[0]}` : `${key[0]}`;
    comment = ` '${comment}' `;
    if (plus && propValue === propValue1) {
      comment += setAdded(propValue);
      out += `${PROP}${comment}\n`;
    }
    if (minus) {
      if (propValue === propValue1) {
        comment += REMOVED;
      } else {
        comment += setUpdated(propValue, propValue1);
      }
      out += `${PROP}${comment}\n`;
    }
    if (!(minus || plus) && propValue === COMPLEX_VALUE) {
      out += getPropValues(strArr, key[1], owner);
    }
  });
  return out;
};

export default (source) => {
  const strArr = source.split('\n');
  const out = getPropValues(strArr, 0, '');
  return out.slice(0, out.length - 1);
};
