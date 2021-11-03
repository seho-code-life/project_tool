import { execSync } from 'child_process'

/**
 * @name 查询是否初始化了git
 * @param {string} cwd
 * @return {*}
 */
export const hasProjectGit = (cwd: string) => {
  let result
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  } catch (e) {
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
export const sortObject = (obj: Record<string, string>, keyOrder?: [], dontSortByUnicode?: boolean) => {
  if (!obj) return
  const res: Record<string, unknown> = {}

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

  return res
}
