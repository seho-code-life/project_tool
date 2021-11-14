import { execSync } from 'child_process'

/**
 * @name 查询项目是否初始化了git
 * @description 如果全局没有git依赖也会返回false
 * @param {string} cwd
 * @param {boolean} init
 * @return {*}
 */
export const hasProjectGit = (cwd: string, init = true) => {
  let result: boolean
  // 判断全局是否有git依赖
  const globalResult = hasGolbalGit()
  if (globalResult) {
    try {
      // 检测项目中是否初始化git
      execSync('git status', { stdio: 'ignore', cwd })
      result = true
    } catch (error) {
      result = false
      // 如果参数init为true，就执行init git的命令
      if (init) {
        execSync('git init', { cwd })
        result = true
      }
    }
  } else {
    result = false
    console.log('⚠️ 部分依赖于git的依赖（husky等）可能安装失败或者无效，可能是以下原因:')
    console.log('1. 请检查全局是否安装了git, 如果没有安装，请自行稍后安装成功后在项目根目录运行 npx husky add .husky/pre-commit "npm run lint-staged"')
  }
  return result
}

/**
 * @name 查看全局是否安装了git
 * @return {*}
 */
export const hasGolbalGit = () => {
  let result = true
  try {
    execSync('git --version')
  } catch (error) {
    result = false
  }
  return result
}

/**
 * @name 给对象排序
 * @param {Record<string, string>} obj
 * @param {[]} keyOrder
 * @param {boolean} dontSortByUnicode
 * @return {*}
 */
export const sortObject = <T extends Record<string, any>>(obj: T, keyOrder?: string[], dontSortByUnicode?: boolean): T => {
  const res = {} as Record<string, any>

  if (keyOrder) {
    keyOrder.forEach((key) => {
      if (obj.hasOwnProperty(key)) {
        res[key] = obj[key]
        delete obj[key]
      }
    })
  }

  const keys = Object.keys(obj)

  !dontSortByUnicode && keys.sort()
  keys.forEach((key) => {
    res[key] = obj[key]
  })

  return res as T
}

/**
 * @name 给packagejson排序
 * @param {PackageData} pkg
 * @return {*}
 */
export const sortPkg = (pkg: PackageData) => {
  pkg.dependencies = sortObject(pkg.dependencies)
  pkg.devDependencies = sortObject(pkg.devDependencies)
  pkg.scripts = sortObject(pkg.scripts, [
    'dev',
    'dev:test',
    'dev:prod',
    'lint',
    'lint:eslint',
    'lint:typescript',
    'prettier',
    'prepare',
    'lint-staged',
    'build',
    'build:test',
    'build:prod',
    'test',
    'serve'
  ])
  pkg = sortObject(pkg, ['version', 'name', 'scripts', 'dependencies', 'devDependencies'])
  return pkg
}
