#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const main = (): void => {
  // 将template中的vscode内容拷贝到根目录
  const rc = fs.readFileSync(path.resolve(__dirname, '..', 'template/eslint/.eslintrc.js'));
  console.log(rc);
  const ignore = fs.readFileSync(path.resolve(__dirname, '..', 'template/eslint/.eslintignore'));
  // fs.writeFileSync('', rc);
  // fs.writeFileSync('', ignore);
};

export default main;
