#!/usr/bin/env node

import path from 'path'
import fs from 'fs'

const main = (template: EditTemplate): CreateFunctionRes => {
  const { package: projectData } = template
  // 修改packagejson
  projectData.devDependencies = {
    ...projectData.devDependencies,
    prettier: '^2.3.2'
  }
  projectData.scripts = {
    ...projectData.scripts,
    prettier: "prettier --write '**/*.{vue,jsx,tsx,js,ts,json,md}'"
  }
  // 将template中的prettierr内容拷贝到根目录
  const rc = fs.readFileSync(path.resolve(__dirname, '..', 'template/prettierr/.prettierrc'))
  const ignore = fs.readFileSync(path.resolve(__dirname, '..', 'template/prettierr/.prettierignore'))
  fs.writeFileSync(path.resolve(template.path, '.prettierrc'), rc)
  fs.writeFileSync(path.resolve(template.path, '.prettierignore'), ignore)
  return {
    projectData
  }
}

export default main
