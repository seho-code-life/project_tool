import inquirer from 'inquirer'
import concurrently from 'concurrently'
import ora from 'ora'
import semver from 'semver'
import flying from 'flyio'
import { CNPM_URL } from './git'
import pkg from '../../package.json'

const spinner = ora()
spinner.color = 'green'

const prompt = inquirer.createPromptModule()

// 检查新版本的函数
export const compareNewVersion = async (): Promise<boolean | string> => {
  return new Promise(async (resolve) => {
    spinner.text = '正在检查工具是否是最新版...'
    spinner.start()
    const result = await flying.get('https://registry.npmjs.org/enjoy-project-tool')
    const latest = result.data['dist-tags']['latest'] as string
    // 判断当前版本是否小于最新版本
    if (semver.lt(pkg.version, latest)) {
      resolve(latest)
    } else {
      // 不需要更新
      spinner.text = `更新检测程序运行完成，您目前是最新版${pkg.version}，请保持～`
      spinner.succeed()
      resolve(false)
    }
  })
}

const update = (targerVersion: string) => {
  return new Promise(async (resolve) => {
    spinner.text = `更新检测程序运行完成，您需要更新了⬇️`
    spinner.succeed()
    prompt([
      {
        type: 'confirm',
        message: `您是否需要使用最新版本运行本工具 (最新版本: ${targerVersion}, 目前版本: ${pkg.version})`,
        name: 'useLatestVersion'
      }
    ]).then(async (res) => {
      // 用户如果选择了使用最新版本更新
      if (res.useLatestVersion) {
        // 如果用户选择更新，调用安装方法
        await concurrently([`npm --registry ${CNPM_URL} i enjoy-project-tool@${targerVersion} -g`], { prefix: 'none' })
        resolve(true)
      } else {
        // 用户没有选择
        resolve(false)
      }
    })
  })
}

export default update
