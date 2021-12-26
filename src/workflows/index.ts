import ora from 'ora'
import flying from 'flyio'
import { getReleaseList, ReturnGetReleaseList, CDN_URL } from '../util/git'

const spinner = ora()
spinner.color = 'green'

const userName = 'seho-code-life'
const projectName = `project_workflows`

let releaseList: ReturnGetReleaseList

export type QuestionAnswers = {
  'workflows-version': string
  version: string
  workflows: string[]
}

export const questions = [
  {
    type: 'list',
    name: 'workflows-version',
    message: '请选择workflows的版本',
    choices: async () => {
      spinner.start('')
      // 获取所属仓库的文件列表
      releaseList = await getReleaseList({ targetBranch: 'master', userName, projectName })
      spinner.stop()
      process.stdin.resume()
      return [
        {
          name: `默认最新版`,
          value: `${releaseList.latest.tag_name}`
        },
        {
          name: `自定义版本`,
          value: `other`
        }
      ]
    }
  },
  {
    type: 'list',
    name: 'version',
    message: '自定义版本',
    choices: async () => {
      return releaseList.list.map((l) => {
        return {
          name: `${l.tag_name} | 更新时间${l.created_at}`,
          value: `${l.tag_name}`
        }
      })
    },
    when: (answers: QuestionAnswers) => {
      return answers['workflows-version'] === 'other'
    }
  },
  {
    type: 'checkbox',
    name: 'workflows',
    message: '请选择要添加的workflow',
    choices: async () => {
      spinner.start('')
      // 获取workflows仓库的字典，我们可以去远程下载这个字典，进行列表的展示
      // 使用cdn下载
      const _res = []
      const res = await flying.get(`${CDN_URL}/https://github.com/seho-code-life/project_workflows/blob/master/dictionary.json`)
      for (const key in res.data) {
        _res.push({
          name: `${key} (${res.data[key]})`,
          value: key
        })
      }
      spinner.stop()
      process.stdin.resume()
      return _res
    }
  }
]
