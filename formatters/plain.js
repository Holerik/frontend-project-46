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
  const out = 'was added with value: ';
  if (value === COMPLEX_VALUE) {
    return `${out}${COMPLEX_VALUE}`;
  }
  return `${out}${TEST_CHARS.includes(value) ? `${value}` : `'${value}'`}`;
};

const whithoutQuotas = (str) => TEST_CHARS.includes(str) || !_.isNaN(_.parseInt(str));

const getOut = (value) => {
  if (value.length === 0) {
    return "''";
  }
  if (value === COMPLEX_VALUE) {
    return COMPLEX_VALUE;
  }
  return whithoutQuotas(value) ? `${value}` : `'${value}'`;
};

const setUpdated = (value1, value2) => `was updated. From ${getOut(value1)} to ${getOut(value2)}`;

const getValue = (str) => {
  const length = str.indexOf('\n') > 0 ? str.length - 1 : str.length;
  return str.slice(str.indexOf(':') + 2, length);
};

const modifyValue = (value) => (value.includes('{') ? '[complex value]' : value);

const findAnotherPropValue = (strArr, key, propValue, keys) => {
  const index = keys.findIndex((elem) => key[2] === elem[2]
    && elem[1] !== key[1] && elem[0] === key[0]);
  if (index === -1) {
    return modifyValue(propValue);
  }
  const res = getValue(strArr[keys[index][1]]);
  return modifyValue(res);
};

const getPropValues = (strArr, ind, parent) => {
  const out = [];
  const tempOwner = getPropName(strArr[ind]);
  const owner = parent.length > 0 ? `${parent}.${tempOwner}` : tempOwner;
  const keys = getSortedObjKeys(strArr, ind);
  keys.forEach((key) => {
    const tempObjVal = getObjValue(strArr, key);
    const tempVal = getValue(tempObjVal);
    const propValue = tempVal.includes('{') ? COMPLEX_VALUE : tempVal;
    const propValue1 = findAnotherPropValue(strArr, key, tempVal, keys);
    const objValue = tempVal.includes('{') ? tempObjVal.slice(0, tempObjVal.indexOf(':')) : tempObjVal;
    const minus = objValue.includes('-');
    const plus = objValue.includes('+');
    const header = (owner.length > 0) ? ` '${owner}.${key[0]}' ` : ` '${key[0]}' `;
    if (plus && propValue === propValue1) {
      out.push(`${PROP}${header}${setAdded(propValue)}\n`);
    }
    if (minus) {
      if (propValue === propValue1) {
        out.push(`${PROP}${header}${REMOVED}\n`);
      } else {
        out.push(`${PROP}${header}${setUpdated(propValue, propValue1)}\n`);
      }
    }
    if (!(minus || plus) && propValue === COMPLEX_VALUE) {
      out.push(getPropValues(strArr, key[1], owner));
    }
  });
  return out.join('');
};

export default (source) => {
  const strArr = source.split('\n');
  const out = getPropValues(strArr, 0, '');
  // удаляем последний символ конца строки
  // будет добавлен в gendiff.js
  return out.slice(0, out.length - 1);
};
