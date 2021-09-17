#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exists } from '../util/file';

const main = (): CreateFunctionRes => {
  const projectData: PackageData = JSON.parse(fs.readFileSync('package.json').toString());
  // 新增依赖/packagejson的配置项
  projectData.scripts = {
    ...projectData.scripts,
    prepare: 'husky install',
    'lint-staged': 'lint-staged'
  };
  // 增加依赖
  projectData.devDependencies = {
    ...projectData.devDependencies,
    husky: '^7.0.1',
    'lint-staged': '^11.1.2'
  };
  // 将写入packagejson TODO
  fs.writeFileSync('package.json', JSON.stringify(projectData, null, 4));
  // 将template的文件复制到根目录
  exists(path.resolve(__dirname, '../template/commitHook/.husky'), '.husky');
  return {
    projectData
  };
};

export default main;
