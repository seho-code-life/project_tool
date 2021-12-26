#!/usr/bin/env node

import inquirer from 'inquirer'
import ora from 'ora'
import fs from 'fs'
import concurrently from 'concurrently'
import { CNPM_URL, CDN_URL, downloadTemplate } from './util/git'
import { hasProjectGit, sortPkg } from './util/index'
import handleVscode from './create/vscode'
import handleUIComponents from './create/uiComponents'
import { questions, FunctionKeys, QuestionAnswers } from './create/index'

const spinner = ora()
spinner.color = 'green'

// 答案内容
let _answers: QuestionAnswers | null = null
// 项目路径
let _projectPath = ''

// 获取基础模板的release列表
inquirer.prompt(questions).then(async (answers: QuestionAnswers) => {
  // 获取答案, 把答案的内容赋值给全局
  _answers = answers
  const { projectName, version } = answers
  // 根据项目名称得到项目根路径
  _projectPath = `${process.cwd()}/${projectName}`
  // 设置template基础url
  let templateUrl = `direct:${CDN_URL}/https://github.com/seho-code-life/project_template/archive/refs/tags/`
  // 处理templateUrl
  templateUrl += `${answers['template-version'] === 'other' ? version : answers['template-version']}.zip`
  spinner.start('下载模板中, 请稍后...')
  // 开始下载模板
  await downloadTemplate({
    repository: templateUrl,
    projectName
  })
  editPackageInfo()
})

// 功能列表的回调字典，内部函数处理了对package的读写&处理文件等操作
const functionsCallBack: Record<FunctionKeys, (params: EditTemplate) => CreateFunctionRes> = {
  vscode: (params: EditTemplate) => handleVscode(params)
}

/**
 * @name 处理对应操作的函数
 * @description eslint, editor等等
 * @param {{ package: PackageData }} params
 * @return {*}  {Promise<void>}
 */

const handleFunctions = (params: { package: PackageData }): Promise<PackageData> => {
  const { functions: checkedfunctions } = _answers as QuestionAnswers
  return new Promise((resolve, reject) => {
    // 执行对应的回调函数
    try {
      checkedfunctions.map((c) => {
        params.package = functionsCallBack[c]({ ...params, path: _projectPath }).projectData
      })
      // 执行uiComponents的逻辑，函数会动态根据用户选择的ui框架返回正确的依赖选项（package.json）
      params.package = handleUIComponents({
        package: params.package,
        path: _projectPath,
        name: _answers!.uiComponents
      })
    } catch (error) {
      reject(
        `处理用户选择的功能时出现了错误: ${error}; 请前往 https://github.com/seho-code-life/project_tool/issues/new 报告此错误; 但是这不影响你使用此模板，您可以自行删减功能`
      )
    }
    resolve(params.package)
  })
}

/**
 * @name 修改package信息（包括调用了处理操作的函数）
 * @description 修改版本号以及项目名称
 */
const editPackageInfo = (): void => {
  const { functions } = _answers as QuestionAnswers
  // 读取项目中的packagejson文件
  fs.readFile(`${_projectPath}/package.json`, async (err, data) => {
    if (err) throw err
    // 获取json数据并修改项目名称和版本号
    let _data = JSON.parse(data.toString())
    // 修改package的name名称
    _data.name = _answers?.projectName
    if (functions) {
      // 处理functions, 去在模板中做一些其他操作，比如删除几行依赖/删除几个文件
      try {
        // handleFunctions函数返回的_data就是处理过的package信息
        _data = await handleFunctions({
          package: _data
        })
      } catch (error) {
        spinner.text = `${error}`
        spinner.fail()
      }
    }
    const str = JSON.stringify(sortPkg(_data), null, 2)
    // 写入文件
    fs.writeFile(`${_projectPath}/package.json`, str, function (err) {
      if (err) throw err
      spinner.text = `下载完成, 正在自动安装项目依赖...`
      install()
    })
  })
}

/**
 * @name 对项目进行install安装依赖操作
 */
const install = async () => {
  const { projectName } = _answers as QuestionAnswers
  const cwd = `${process.cwd()}/${projectName}`
  spinner.text = '🤔 自动安装&初始化项目中...'
  // 执行install
  // 删除空文件夹中的gitkeep 占位文件
  // 初始化git
  // 如果用户选择了拦截钩子，就初始化husky pre commit
  try {
    await concurrently([`npm --registry ${CNPM_URL} i`, `find ./ -type f -name '.gitkeep' -delete`], { cwd })
    // 调用初始化git的方法
    hasProjectGit(cwd)
    spinner.text = `✌️ 安装成功, 进入${projectName}开始撸码～`
    spinner.succeed()
  } catch (error) {
    spinner.text = `自动安装失败, 请查看错误，且之后自行安装依赖～`
    spinner.fail()
    console.error(error)
  }
}
