#!/usr/bin/env node
// gendiff.js

import { program } from 'commander';
import genDifference from './gen-difference.js';

const stylish = (file1, file2) => {
  console.log(genDifference(file1, file2));
};

function compareFiles() {
  program
    .option('-h, --help', 'display help for command')
    .command('gendiff')
    .description('Compares two configuration files and shows a difference.\n')
    .version('0.0.1', '-v, --version', 'output the version number')
    .option('-f, --format <type>', 'output format')
    .arguments('<filepath1> <filepath2>')
    .action(stylish)
    .parse(process.argv);
}

compareFiles();
