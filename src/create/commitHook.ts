#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
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
 * @name 初始化lintstage规则文件
 * @description 根据条件动态的构造出一组正确的lintstage拦截命令
 * @param {{ isEslint: boolean; isPrettier: boolean; packageData: PackageData }} params
 */
export const initLintStage = (params: { isEslint: boolean; isPrettier: boolean; path: string }) => {
  const { isEslint, isPrettier, path } = params
  // 初始化lint_stage 命令
  const lint_stage: Record<'*.{ts,tsx}' | '*.vue' | '*.{json,js,jsx}', string[]> = {
    '*.{ts,tsx}': ['tsc --noEmit'],
    '*.vue': ['vue-tsc --noEmit'],
    '*.{json,js,jsx}': []
  }
  if (isEslint || isPrettier) {
    // 这里的orders是一个数组，数组从头到尾是依次执行的命令
    const ts_orders = lint_stage['*.{ts,tsx}']
    const vue_orders = lint_stage['*.vue']
    const js_orders = lint_stage['*.{json,js,jsx}']
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
  // 将命令输出到lint-staged.config.js中
  fs.writeFileSync(`${path}/lint-staged.config.js`, `module.exports = ${JSON.stringify(lint_stage)}`)
}

export default main
