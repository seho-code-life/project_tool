#!/usr/bin/env node

import path from 'path'
import fs from 'fs'

const main = (template: EditTemplate): CreateFunctionRes => {
  const { package: projectData } = template
  // 修改packagejson
  projectData.devDependencies = {
    ...projectData.devDependencies,
    '@types/jest': '^27.0.2',
    jest: '^27.3.1',
    'ts-jest': '^27.0.7'
  }
  projectData.scripts = {
    ...projectData.scripts,
    test: 'NODE_OPTIONS=--experimental-vm-modules jest'
  }
  // 将template中的jest内容拷贝到根目录
  const jest = fs.readFileSync(path.resolve(__dirname, '..', 'template/jest/jest.config.mjs'))
  fs.writeFileSync(path.resolve(template.path, 'jest.config.mjs'), jest)
  return {
    projectData
  }
}

export default main
