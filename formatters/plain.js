// plain.js
// Функции для обработки результатов сравнения и
// представления их в плоском стиле
import _ from 'lodash';
import { getSortedObjKeys, getObjValue, getPropName } from './stylish.js';

const TEST_CHARS = 'false|true|null';
const COMPLEX_VALUE = '[complex value]';
const PROP = 'Property';
const REMOVED = 'was removed';

const whithoutQuotas = (str) => TEST_CHARS.includes(str) || !_.isNaN(_.parseInt(str));

const setAdded = (value) => {
  const out = 'was added with value: ';
  if (value === COMPLEX_VALUE) {
    return `${out}${COMPLEX_VALUE}`;
  }
  return `${out}${whithoutQuotas(value) ? `${value}` : `'${value}'`}`;
};

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

const addPropValue = (strArr, keys, owner, out, index) => {
  if (index === keys.length) {
    return out;
  }
  const tempObjVal = getObjValue(strArr, keys[index]);
  const tempVal = getValue(tempObjVal);
  const propValue = tempVal.includes('{') ? COMPLEX_VALUE : tempVal;
  const propValue1 = findAnotherPropValue(strArr, keys[index], tempVal, keys);
  const objValue = tempVal.includes('{') ? tempObjVal.slice(0, tempObjVal.indexOf(':')) : tempObjVal;
  const minus = objValue.includes('-');
  const plus = objValue.includes('+');
  const header = (owner.length > 0) ? ` '${owner}.${keys[index][0]}' ` : ` '${keys[index][0]}' `;

  if (plus && propValue === propValue1) {
    return addPropValue(strArr, keys, owner, `${out}${PROP}${header}${setAdded(propValue)}\n`, index + 1);
  }
  if (minus) {
    if (propValue === propValue1) {
      return addPropValue(strArr, keys, owner, `${out}${PROP}${header}${REMOVED}\n`, index + 1);
    }
    return addPropValue(
      strArr,
      keys,
      owner,
      `${out}${PROP}${header}${setUpdated(propValue, propValue1)}\n`,
      index + 1,
    );
  }
  if (!(minus || plus) && propValue === COMPLEX_VALUE) {
    return addPropValue(
      strArr,
      keys,
      owner,
      // eslint-disable-next-line no-use-before-define
      `${out}${getPropValues(strArr, keys[index][1], owner)}`,
      index + 1,
    );
  }
  return addPropValue(strArr, keys, owner, `${out}`, index + 1);
};

const getPropValues = (strArr, ind, parent) => {
  const tempOwner = getPropName(strArr[ind]);
  const owner = parent.length > 0 ? `${parent}.${tempOwner}` : tempOwner;
  const keys = getSortedObjKeys(strArr, ind);
  return addPropValue(strArr, keys, owner, '', 0);
};

export default (source) => {
  const strArr = source.split('\n');
  const out = getPropValues(strArr, 0, '');
  // удаляем последний символ конца строки
  // будет добавлен в gendiff.js
  return out.slice(0, out.length - 1);
};
