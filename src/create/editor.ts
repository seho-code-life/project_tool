#!/usr/bin/env node

import path from 'path';
import { exists } from '../util/file';

const main = (): void => {
  // 将template中的vscode内容拷贝到根目录
  exists(path.resolve(__dirname, '../template/editor/.editorconfig'), '.editorconfig');
};

export default main;
