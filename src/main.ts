#!/usr/bin/env node

// 命令行
import { program } from 'commander';
import pkg from '../package.json';
import welcome from './welcome.js';

// 输入-v， --version查看当前工具的版本
program.version(pkg.version, '-v, --version').description('查看当前版本号');

program
  .command('create')
  .description('create template (创建模板)')
  .action(async () => {
    // 引入欢迎👏页面
    welcome();
    await import('./create.js');
  });

program.parse(process.argv);
