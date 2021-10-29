#!/usr/bin/env node

import inquirer from 'inquirer'
import ora from 'ora'
import fs from 'fs'
import { exec } from 'child_process'
import download from 'download-git-repo'
import chalk from 'chalk'
import handleEditor from './create/editor'
import handleCommitHook from './create/commitHook'
import handleEslint, { eslintConfigAddPrettierr } from './create/eslint'
import handlePrettierr from './create/prettierr'
import handleVscode from './create/vscode'
import handleJest from './create/jest'
import packageData from '../package.json'

const spinner = ora('下载模板中, 请稍后...')

// 模板列表
const template: { name: string; value: string }[] = [
  {
    name: 'vue3-vite2-ts-template (⚡️淘宝源极速下载)',
    value: `direct:https://github.com.cnpmjs.org/seho-code-life/project_template/archive/refs/tags/v${packageData.version}.zip`
  },
  {
    name: 'node-command-ts-template',
    value: 'seho-code-life/project_template#node-command-cli'
  },
  {
    name: 'rollup-typescript-package',
    value: 'seho-code-life/project_template#rollup-typescript-package(release)'
  }
]

// 定义功能的key数组
type FunctionKeys = 'editor' | 'commitHook' | 'eslint' | 'prettierr' | 'vscode' | 'jest'

// function功能列表
const functionsList: { name: string; value: FunctionKeys; checked: boolean }[] = [
  {
    name: 'editorconfig (统一IDE配置)',
    value: 'editor',
    checked: true
  },
  {
    name: 'husky & lint-staged 基础GIT设施',
    value: 'commitHook',
    checked: true
  },
  {
    name: 'eslint代码校验',
    value: 'eslint',
    checked: true
  },
  {
    name: 'prettierr美化',
    value: 'prettierr',
    checked: true
  },
  {
    name: 'jest单元测试',
    value: 'jest',
    checked: true
  },
  {
    name: 'vscode相关配置 (setting + code-snippets)',
    value: 'vscode',
    checked: false
  }
]

// 功能列表的回调字典，内部函数处理了对package的读写&处理文件等操作
const functionsCallBack: Record<FunctionKeys, (params: EditTemplate) => CreateFunctionRes> = {
  editor: (params: EditTemplate) => handleEditor(params),
  commitHook: (params: EditTemplate) => handleCommitHook(params),
  eslint: (params: EditTemplate) => handleEslint(params),
  prettierr: (params: EditTemplate) => handlePrettierr(params),
  vscode: (params: EditTemplate) => handleVscode(params),
  jest: (params: EditTemplate) => handleJest(params)
}

/**
 * @name 处理对应操作的函数
 * @description eslint, editor等等
 * @param {({ checkedfunctions: FunctionKeys[] } & EditTemplate)} params
 * @return {*}  {Promise<void>}
 */
const handleFunctions = (params: { checkedfunctions: FunctionKeys[] } & EditTemplate): Promise<PackageData> => {
  const { checkedfunctions } = params
  return new Promise((resolve, reject) => {
    // 执行对应的回调函数
    try {
      checkedfunctions.map((c) => {
        params.package = functionsCallBack[c](params).projectData
      })
      // 判断是否选择了eslint / prettierr
      const isEslint = checkedfunctions.includes('eslint')
      const isPrettierr = checkedfunctions.includes('prettierr')
      // 处理函数中有一些部分比较复杂，比如lint和eslint的组合搭配，这部分我们单独写，就不归纳到处理函数字典里了
      // 如果用户选择了commitHook，且要和eslint，prettierr搭配
      if (checkedfunctions.includes('commitHook')) {
        const ruleKey = '*.{vue,ts,tsx,js,jsx,json,markdown}'
        // 如果选择了commithook，就初始化lint-stage的脚本, 默认我们拼接一个git add
        params.package['lint-staged'] = {
          [ruleKey]: ['git add']
        }
        if (isEslint || isPrettierr) {
          // 这里的orders是一个数组，数组从头到尾是依次执行的命令
          const orders = params.package['lint-staged'][ruleKey]
          // 判断如果是eslint，就在数组最前面拼接命令
          if (isEslint) {
            orders.unshift('eslint --fix')
          }
          // 判断prettierr
          if (isPrettierr) {
            orders.unshift('prettier --write')
          }
        }
      }
      // 如果二者都被选中，就需要eslint对prettierr进行扩充，调用eslint中暴露的一个函数
      if (isEslint && isPrettierr) {
        params.package = eslintConfigAddPrettierr(params).projectData
      }
    } catch (error) {
      reject(
        `处理用户选择的功能时出现了错误: ${error}; 请前往 https://github.com/seho-code-life/project_tool/issues/new 报告此错误; 但是这不影响你使用此模板，您可以自行删减功能`
      )
    }
    resolve(params.package)
  })
}

/**
 * @name 对项目进行install安装依赖操作
 * @param {{ projectName: string }} params
 */
const install = (params: { projectName: string }): void => {
  const { projectName } = params
  spinner.text = '正在安装依赖...'
  // 执行install, 且删除空文件夹中的gitkeep 占位文件
  exec(
    `cd ${projectName} && npm i --registry https://registry.npm.taobao.org & find ./ -type f -name '.gitkeep' -delete`,
    {
      maxBuffer: 5000 * 1024
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return
      } else if (stdout) {
        spinner.text = `安装成功, 进入${projectName}开始撸码～`
        spinner.succeed()
      } else {
        spinner.text = `自动安装失败, 请查看错误，且之后自行安装依赖～`
        spinner.fail()
        console.error(stderr)
      }
    }
  )
}

/**
 * @name 修改package信息（包括调用了处理操作的函数）
 * @description 修改版本号以及项目名称
 * @param {{ projectName: string; functions: FunctionKeys[] }} params
 */
const editPackageInfo = (params: { projectName: string; functions?: FunctionKeys[] }): void => {
  const { projectName, functions } = params
  // 获取项目路径
  const path = `${process.cwd()}/${projectName}`
  // 读取项目中的packagejson文件
  fs.readFile(`${path}/package.json`, async (err, data) => {
    if (err) throw err
    // 获取json数据并修改项目名称和版本号
    let _data = JSON.parse(data.toString())
    // 修改package的name名称
    _data.name = projectName
    if (functions) {
      // 处理functions, 去在模板中做一些其他操作，比如删除几行依赖/删除几个文件
      try {
        // handleFunctions函数返回的_data就是处理过的package信息
        _data = await handleFunctions({
          checkedfunctions: functions,
          package: _data,
          path
        })
      } catch (error) {
        spinner.text = `${error}`
        spinner.fail()
      }
    }
    const str = JSON.stringify(_data, null, 2)
    // 写入文件
    fs.writeFile(`${path}/package.json`, str, function (err) {
      if (err) throw err
      spinner.text = `下载完成, 正在自动安装项目依赖...`
      install({ projectName })
    })
  })
}

/**
 * @name 下载远端模板
 * @param {{ repository: string; projectName: string; functions: FunctionKeys[] }} params
 */
const downloadTemplate = (params: { repository: string; projectName: string; functions?: FunctionKeys[] }): void => {
  const { repository, projectName, functions } = params
  download(repository, projectName, (err) => {
    if (!err) {
      editPackageInfo({ projectName, functions })
    } else {
      spinner.stop() // 停止
      console.log(chalk.red('拉取模板出现未知错误'))
    }
  })
}

// 定义问题列表
const questions = [
  {
    type: 'input',
    name: 'projectName',
    message: '项目文件夹名称:',
    validate(val?: string) {
      if (!val) {
        // 验证一下输入是否正确
        return '请输入文件名'
      }
      if (fs.existsSync(val)) {
        // 判断文件是否存在
        return '文件已存在'
      } else {
        return true
      }
    }
  },
  {
    type: 'list',
    name: 'template',
    choices: template,
    message: '请选择要拉取的模板'
  },
  {
    type: 'checkbox',
    name: 'functions',
    choices: functionsList,
    message: '请选择默认安装的功能',
    when: (answers: QuestionAnswers) => {
      // 如果template是package的模板，就不让用户选择功能
      return answers.template !== 'seho-code-life/project_template#rollup-typescript-package(release)'
    }
  }
]

type QuestionAnswers = {
  template: string
  projectName: string
  functions: FunctionKeys[]
}

inquirer.prompt(questions).then((answers: QuestionAnswers) => {
  // 获取答案
  const { template: templateUrl, projectName, functions } = answers
  spinner.start()
  spinner.color = 'green'
  // 开始下载模板
  downloadTemplate({
    repository: templateUrl,
    projectName,
    functions
  })
})
