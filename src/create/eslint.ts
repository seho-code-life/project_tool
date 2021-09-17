#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const main = (template: EditTemplate): CreateFunctionRes => {
  const { package: projectData } = template;
  // 添加script
  projectData.scripts = {
    ...projectData.scripts,
    lint: "eslint 'src/**/*' --fix"
  };
  // 添加开发依赖
  projectData.devDependencies = {
    ...projectData.devDependencies,
    'babel-eslint': '^10.1.0',
    eslint: '^7.32.0',
    'eslint-config-prettier': '^8.3.0',
    'eslint-plugin-import': '^2.24.0',
    'eslint-plugin-prettier': '^3.4.0',
    'eslint-plugin-vue': '^7.17.0'
  };
  // 将template中的vscode内容拷贝到根目录
  const rc = fs.readFileSync(path.resolve(__dirname, '..', 'template/eslint/.eslintrc.js'));
  const ignore = fs.readFileSync(path.resolve(__dirname, '..', 'template/eslint/.eslintignore'));
  fs.writeFileSync(path.resolve(template.path, '.eslintrc.js'), rc);
  fs.writeFileSync(path.resolve(template.path, '.eslintignore'), ignore);
  return {
    projectData
  };
};

export default main;
