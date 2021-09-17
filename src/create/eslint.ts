#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exists } from './../util/file';

const main = (): void => {
  // 将template中的vscode内容拷贝到根目录
  const rc = fs.readFileSync(path.resolve(__dirname, '..', 'template/eslint/.eslintrc.js'));
  const ignore = fs.readFileSync(path.resolve(__dirname, '..', 'template/eslint/.eslintignore'));
  fs.writeFileSync('.eslintrc.js', rc);
  fs.writeFileSync('.eslintignore', ignore);
};

export default main;
