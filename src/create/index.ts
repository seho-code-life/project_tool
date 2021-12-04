import fs from 'fs'
import ora from 'ora'
import { getReleaseList, getLatestRelease } from '../util/git'

const spinner = ora()
spinner.color = 'green'

// 定义功能的key数组
export type FunctionKeys = 'editor' | 'commitHook' | 'eslint' | 'prettier' | 'vscode' | 'jest'
// 定义checkbox类型
export type CheckList = { name: string; value: FunctionKeys | string; checked: boolean }[]

export type QuestionAnswers = {
  template: string | null
  projectName: string
  functions: FunctionKeys[]
  'template-version': string | 'other'
  version: string
  uiComponents: 'antdv' | 'element-plus' | 'vant'
}

// 模板列表
export const template: { name: string; value: string | null }[] = [
  {
    name: 'vue3-vite2-ts-template (⚡️极速下载)',
    value: null
  },
  {
    name: 'node-command-ts-template',
    value: 'node-command-cli'
  },
  {
    name: 'rollup-typescript-package-template',
    value: 'rollup-typescript-package'
  }
]

// function功能列表
export const functionsList: CheckList = [
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

// ui框架选择
export const uiComponents: CheckList = [
  {
    name: 'ant-design for vue3.js',
    value: 'antdv',
    checked: true
  },
  {
    name: 'element-plus for vue3.js',
    value: 'element-plus',
    checked: false
  },
  {
    name: 'vant ui for vue3.js',
    value: 'vant',
    checked: false
  }
]
// 定义问题列表
export const questions = [
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
    choices: async (e) => {
      spinner.start('')
      // 获取release 列表
      console.log(e)
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
    message: '请选择模板的版本'
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
          name: `${l.tag_name} | 更新时间${l.created_at}`,
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
  },
  {
    type: 'list',
    name: 'uiComponents',
    choices: uiComponents,
    message: '请选择默认安装的ui组件库',
    when: (answers: QuestionAnswers) => {
      // 如果template是package的模板，就不让用户选择功能
      return answers.template !== 'seho-code-life/project_template#rollup-typescript-package(release)'
    }
  }
]
