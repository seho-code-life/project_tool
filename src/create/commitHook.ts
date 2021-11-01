#!/usr/bin/env node

import path from 'path'
import { exists } from '../util/file'

const main = (template: EditTemplate): CreateFunctionRes => {
  const { package: projectData } = template
  // 新增依赖/packagejson的配置项&增加配置脚本
  projectData.scripts = {
    ...projectData.scripts,
    lint: 'npm run lint:eslint && npm run lint:typescript',
    'lint:eslint': "eslint 'src/**/*' --fix",
    prepare: 'husky install',
    'lint-staged': 'lint-staged'
  }
  // 增加依赖
  projectData.devDependencies = {
    ...projectData.devDependencies,
    husky: '^7.0.1',
    'lint-staged': '^11.1.2'
  }
  // 将template的文件复制到根目录
  exists(path.resolve(__dirname, '../template/commitHook/.husky'), '.husky', {
    dstPath: template.path
  })
  return {
    projectData
  }
}

export default main
