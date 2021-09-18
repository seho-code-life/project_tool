#!/usr/bin/env node

// 命令行
import { program } from 'commander';

// fs.readFileSync("../../package.json")
// 输入-v， --version查看当前工具的版本
// program.version(version, '-v, --version').description('查看当前版本号');

program
  .command('create')
  .description('create template (创建模板)')
  .action(async () => {
    await import('./create.js');
  });

program.parse(process.argv);
