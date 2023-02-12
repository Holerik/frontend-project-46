#!/usr/bin/env node
// gendiff.js

import { program } from 'commander';

program
  .description('Compares two configuration files and shows a difference.\n')
  .option('-h, --help', 'display help for command')
  .version('0.0.1', '-v, --version', 'output the version number');

program.parse(process.argv);

const options = program.opts();

if (options.help) {
  program.outputHelp();
}

