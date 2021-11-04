#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const main = (template: EditTemplate): CreateFunctionRes => {
  const { package: projectData } = template
  // 添加script
  projectData.scripts = {
    ...projectData.scripts,
    lint: 'concurrently "npm:lint:eslint" "npm:lint:typescript"',
    'lint:eslint': "eslint 'src/**/*' --fix"
  }
  // 添加开发依赖
  projectData.devDependencies = {
    ...projectData.devDependencies,
    'babel-eslint': '^10.1.0',
    eslint: '^7.32.0',
    'eslint-plugin-import': '^2.24.0',
    'eslint-plugin-vue': '^7.17.0',
    '@typescript-eslint/eslint-plugin': '^4.29.2',
    '@typescript-eslint/parser': '^4.29.2'
  }
  // 将template中的vscode内容拷贝到根目录
  const rc = fs.readFileSync(path.resolve(__dirname, '..', 'template/eslint/.eslintrc.js'))
  const ignore = fs.readFileSync(path.resolve(__dirname, '..', 'template/eslint/.eslintignore'))
  fs.writeFileSync(path.resolve(template.path, '.eslintrc.js'), rc)
  fs.writeFileSync(path.resolve(template.path, '.eslintignore'), ignore)
  return {
    projectData
  }
}

/**
 * @name 封装eslint配置添加prettierr配置
 * @description 封装如果选择了eslint和prettierr，需要添加对应的依赖，并且和原eslint进行兼容
 */
export const eslintConfigAddPrettier = (template: EditTemplate): CreateFunctionRes => {
  // 获取目标的path
  const { path: _path, package: projectData } = template
  // 获取eslintconfig
  let eslintConfigStr = fs.readFileSync(path.resolve(_path, '.eslintrc.js')).toString()
  // 查询模板中的代码，以此代码作为flag，因为这段兼容性代码，确实是要加在这段代码（flagCode）的下方
  const flagCode = "'plugin:@typescript-eslint/recommended'"
  eslintConfigStr = eslintConfigStr.replace(flagCode, `${flagCode},\n    'plugin:prettier/recommended'`)
  //写入文件
  fs.writeFileSync(path.resolve(_path, '.eslintrc.js'), eslintConfigStr)
  // 向packagejson中添加兼容依赖（兼容prettier）
  projectData.devDependencies = {
    ...projectData.devDependencies,
    'eslint-config-prettier': '^8.3.0',
    'eslint-plugin-prettier': '^3.4.0'
  }
  return {
    projectData
  }
}

export default main
