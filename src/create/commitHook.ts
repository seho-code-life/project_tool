#!/usr/bin/env node

import path from 'path'
import { exists } from '../util/file'

const main = (template: EditTemplate): CreateFunctionRes => {
  const { package: projectData } = template
  // 新增依赖/packagejson的配置项&增加配置脚本
  projectData.scripts = {
    ...projectData.scripts,
    prepare: 'husky install',
    'lint-staged': 'lint-staged'
  }
  // 增加依赖
  projectData.devDependencies = {
    ...projectData.devDependencies,
    husky: '^7.0.1',
    'lint-staged': '^11.1.2'
  }
  return {
    projectData
  }
}

/**
 * @name 初始化lintstage命令
 * @description 根据条件动态的构造出一个正确的lintstage拦截命令
 * @param {{ isEslint: boolean; isPrettier: boolean; packageData: PackageData }} params
 */
export const initLintStage = (params: { isEslint: boolean; isPrettier: boolean; package: PackageData }) => {
  const { isEslint, isPrettier } = params
  // 如果选择了commithook，就初始化lint-stage的脚本, 默认我们拼接一个git add
  params.package['lint-staged'] = {
    '*.{ts,tsx}': ['tsc --noEmit --pretty false --skipLibCheck', 'git add'],
    '*.{json,js,jsx}': ['git add'],
    '*.vue': ['vue-tsc --noEmit --skipLibCheck', 'git add']
  }
  if (isEslint || isPrettier) {
    // 这里的orders是一个数组，数组从头到尾是依次执行的命令
    const ts_orders = params.package['lint-staged']['*.{ts,tsx}']
    const js_orders = params.package['lint-staged']['*.{json,js,jsx}']
    const vue_orders = params.package['lint-staged']['*.vue']
    // 判断如果是eslint，就在数组最前面拼接命令
    if (isEslint) {
      const code = 'eslint --fix'
      ts_orders.unshift(code)
      js_orders.unshift(code)
      vue_orders.unshift(code)
    }
    // 判断prettier
    if (isPrettier) {
      const code = 'prettier --write'
      ts_orders.unshift(code)
      js_orders.unshift(code)
      vue_orders.unshift(code)
    }
  }
  return params.package
}

export default main
