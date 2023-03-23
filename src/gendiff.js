#!/usr/bin/env node
// gendiff.js

import { program } from 'commander';
import compare from './gen-difference.js';

const genDiff = (file1, file2, options) => {
  const style = options.format === undefined ? 'plain' : options.format;
  return compare(file1, file2, style);
};

function compareFiles() {
  program
    .option('-h, --help', 'display help for command')
    .command('gendiff')
    .description('Compares two configuration files and shows a difference.\n')
    .version('0.0.1', '-v, --version', 'output the version number')
    .allowUnknownOption()
    .option('-f, --format <type>', 'output format', 'stylish')
    .arguments('<filepath1> <filepath2>')
    .action(genDiff)
    .parse(process.argv);
}

compareFiles();

export default genDiff;
