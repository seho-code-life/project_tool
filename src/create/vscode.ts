#!/usr/bin/env node

import path from 'path';
import { exists } from '../util/file';

const main = (template: EditTemplate): CreateFunctionRes => {
  const { package: projectData } = template;
  // 将template中的vscode内容拷贝到根目录
  exists(path.resolve(__dirname, '../template/vscode/.vscode'), '.vscode', {
    dstPath: template.path
  });
  return {
    projectData
  };
};

export default main;
