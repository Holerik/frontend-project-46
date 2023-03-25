// json.js
// Представление в json-формате результатов сравнения
// двух файлов в плоском и стуктурированном форматах
import { getFilePath } from '../src/parser.js';

// Замена всех встечающихся в строке символов what на символ whith
const replace = (str, what, whith) => str.replaceAll(what, whith);

// Выводим в формате json поля с ключами:
// filePath1: содержит информацию о файле file1
// filePath2: содержит информацию о файле file2
// plain: содержит резуьтат сравнения файлов в плоском формате
// stylish: содержит резуьтат сравнения файлов в стуктурированном формате
export default (stylish, plain, file1, file2) => {
  const pData = replace(plain, '\n', '\\n');
  const sData = replace(stylish, '\n', '\\n');
  const fPath1 = replace(getFilePath(file1), '\\', '/');
  const fPath2 = replace(getFilePath(file2), '\\', '/');
  return `{"filePath1":"${fPath1}","filePath2":"${fPath2}","plain":"${pData}","stylish":"${sData}"}`;
};
