#!/usr/bin/env node

import path from 'path';
import fs from 'fs';

const main = (): CreateFunctionRes => {
  // 修改packagejson
  const projectData: PackageData = JSON.parse(fs.readFileSync('package.json').toString());
  projectData.devDependencies = {
    ...projectData.devDependencies,
    prettier: '^2.3.2'
  };
  fs.writeFileSync('package.json', JSON.stringify(projectData, null, 4));
  // 将template中的prettierr内容拷贝到根目录
  const rc = fs.readFileSync(path.resolve(__dirname, '..', 'template/prettierr/.prettierrc'));
  const ignore = fs.readFileSync(path.resolve(__dirname, '..', 'template/prettierr/.prettierignore'));
  fs.writeFileSync('.prettierrc', rc);
  fs.writeFileSync('.prettierignore', ignore);
  return {
    projectData
  };
};

export default main;
