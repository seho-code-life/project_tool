#!/usr/bin/env node

import inquirer from 'inquirer'
import { blue, red } from 'chalk'
import ora from 'ora'
import flying from 'flyio'
import { CDN_URL } from './util/git'
import { writeFileRecursive } from './util/file'
import { questions, QuestionAnswers } from './workflows/index'

console.log(blue(`您正在添加workflow，需要您将此命令行程序运行在您项目根目录下`))

const spinner = ora()
spinner.color = 'green'

// 答案内容
let _answers: QuestionAnswers | null = null

// 项目路径 (根目录)
const _projectPath = `${process.cwd()}`

inquirer.prompt(questions).then(async (answers: QuestionAnswers) => {
  // 获取答案, 把答案的内容赋值给全局
  _answers = answers
  const { version, workflows } = answers
  // 判断是否选择了自定义版本
  const _version = `${_answers['workflows-version'] === 'other' ? version : _answers['workflows-version']}`
  const templateUrl = `${CDN_URL}/https://github.com/seho-code-life/project_workflows/blob/${_version}/src/`
  spinner.start('请稍后...')
  // 根据选择的workflow构造promise
  const _workflows = workflows.map((w) => {
    return flying.get(`${templateUrl}${w}`, {
      headers: {
        'workflow-name': w
      }
    })
  })
  try {
    const result = await flying.all(_workflows)
    spinner.text = '下载完成, 正在安装...'
    spinner.succeed()
    // 请求完毕，我们将依次地把workflow内容追加到项目中
    try {
      result.map((r) => {
        const fileName = r.request.body.headers['workflow-name']
        const fileData = r.data
        writeFileRecursive(`${_projectPath}/.github/workflows/${fileName}`, fileData, (err) => {
          if (err) {
            console.log(red(`🙅 ${fileName}创建失败`))
          } else {
            console.log(red(`🙆 ${fileName}创建成功`))
          }
        })
      })
    } catch {}
  } catch (error) {
    spinner.text = '下载出错'
    spinner.fail()
    console.log(error)
  }
})
