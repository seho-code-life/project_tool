#!/usr/bin/env node

import inquirer from 'inquirer'
import ora from 'ora'
import fs from 'fs'
import download from 'download-git-repo'
import concurrently from 'concurrently'
import chalk from 'chalk'
import { getReleaseList, getLatestRelease, CDN_URL, CNPM_URL } from './util/git'
import { hasProjectGit, sortObject } from './util/index'
import handleEditor from './create/editor'
import handleCommitHook, { initLintStage } from './create/commitHook'
import handleEslint, { eslintConfigAddPrettier } from './create/eslint'
import handlePrettier from './create/prettier'
import handleVscode from './create/vscode'
import handleJest from './create/jest'

const spinner = ora()
spinner.color = 'green'

// 定义功能的key数组
type FunctionKeys = 'editor' | 'commitHook' | 'eslint' | 'prettier' | 'vscode' | 'jest'

// 模板列表
const template: { name: string; value: string }[] = [
  {
    name: 'vue3-vite2-ts-template (⚡️极速下载)',
    value: `direct:${CDN_URL}/https://github.com/seho-code-life/project_template/archive/refs/tags/`
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
    name: 'prettier美化',
    value: 'prettier',
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
  prettier: (params: EditTemplate) => handlePrettier(params),
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
      // 判断是否选择了eslint / prettier
      const isEslint = checkedfunctions.includes('eslint')
      const isPrettier = checkedfunctions.includes('prettier')
      // 处理函数中有一些部分比较复杂，比如lint和eslint的组合搭配，这部分我们封装到commithook钩子里面
      // 如果用户选择了commitHook，且要和eslint，prettier搭配
      if (checkedfunctions.includes('commitHook')) {
        initLintStage({
          package: params.package,
          isPrettier,
          isEslint
        })
      }
      // 如果二者都被选中，就需要eslint对prettier进行扩充，调用eslint中暴露的一个函数
      if (isEslint && isPrettier) {
        params.package = eslintConfigAddPrettier(params).projectData
      }
    } catch (error) {
      reject(
        `处理用户选择的功能时出现了错误: ${error}; 请前往 https://github.com/seho-code-life/project_tool/issues/new 报告此错误; 但是这不影响你使用此模板，您可以自行删减功能`
      )
    }
    resolve(params.package)
  })
}

// 定义问题列表
const questions = [
  {
    type: 'input',
    name: 'projectName',
    message: '项目文件夹名称',
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
    type: 'list',
    name: 'template-version',
    choices: async () => {
      spinner.start('')
      const result = await getLatestRelease()
      spinner.stop()
      process.stdin.resume()
      return [
        {
          name: `默认最新版`,
          value: `${result.version}`
        },
        {
          name: `自定义版本`,
          value: `other`
        }
      ]
    },
    message: '请选择模板的版本',
    when: (answers: QuestionAnswers) => {
      // 如果template是package的模板，就不让用户选择功能
      return answers.template !== 'seho-code-life/project_template#rollup-typescript-package(release)'
    }
  },
  {
    type: 'list',
    name: 'version',
    choices: async () => {
      spinner.start('正在从远端获取版本列表...')
      const result = await getReleaseList()
      spinner.stop()
      process.stdin.resume()
      return result.list.map((l) => {
        return {
          name: `${l.tag_name} | 更新时间${l.created_at} ｜ 查看详情(${l.html_url})`,
          value: `${l.tag_name}`
        }
      })
    },
    message: '自定义版本',
    when: (answers: QuestionAnswers) => {
      return answers['template-version'] === 'other'
    }
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
  'template-version': string | 'other'
  version: string
}

// 获取基础模板的release列表
inquirer.prompt(questions).then((answers: QuestionAnswers) => {
  // 获取答案
  // eslint-disable-next-line prefer-const
  let { template: templateUrl, projectName, functions, version } = answers
  // 处理templateUrl
  if (templateUrl.includes('direct')) {
    // 向templateUrl后面拼接版本号+zip格式
    templateUrl += `${answers['template-version'] || version}.zip`
  }
  spinner.start('下载模板中, 请稍后...')
  // 开始下载模板
  downloadTemplate({
    repository: templateUrl,
    projectName,
    functions
  })
})

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
      console.log(err)
      spinner.stop() // 停止
      console.log(chalk.red('拉取模板出现未知错误'))
    }
  })
}

/**
 * @name 给packagejson排序
 * @param {PackageData} pkg
 * @return {*}
 */
const sortPkg = (pkg: PackageData) => {
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
  pkg = sortObject(pkg, ['version', 'name', 'scripts', 'lint-staged', 'dependencies', 'devDependencies'])
  return pkg
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
    const str = JSON.stringify(sortPkg(_data), null, 2)
    // 写入文件
    fs.writeFile(`${path}/package.json`, str, function (err) {
      if (err) throw err
      spinner.text = `下载完成, 正在自动安装项目依赖...`
      install({ projectName, functions })
    })
  })
}

/**
 * @name 对项目进行install安装依赖操作
 * @param {{ projectName: string, functions?: FunctionKeys[]}} params
 */
const install = async (params: { projectName: string; functions?: FunctionKeys[] }) => {
  const { projectName, functions } = params
  const cwd = `${process.cwd()}/${projectName}`
  spinner.text = '🤔 自动安装&初始化项目中...'
  // 执行install
  // 删除空文件夹中的gitkeep 占位文件
  // 初始化git
  // 如果用户选择了拦截钩子，就初始化husky pre commit
  try {
    await concurrently([`npm --registry ${CNPM_URL} i`, `find ./ -type f -name '.gitkeep' -delete`], { cwd, raw: true })
    const hasGit = hasProjectGit(cwd)
    // 如果初始化git成功/本身具有git目录，就进入 添加husky命令 的逻辑
    if (hasGit) {
      if (functions && functions.includes('commitHook')) {
        // 执行husky命令时，需要首先执行预定义好的npm run prepare 再执行 add的操作
        await concurrently([`npm run prepare && npx husky add .husky/pre-commit "npm run lint-staged"`], { cwd, raw: false })
      }
    }
    spinner.text = `✌️ 安装成功, 进入${projectName}开始撸码～`
    spinner.succeed()
  } catch (error) {
    spinner.text = `自动安装失败, 请查看错误，且之后自行安装依赖～`
    spinner.fail()
    console.error(error)
  }
}
