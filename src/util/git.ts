import flying from 'flyio'
import randomUseragent from 'random-useragent'
import download from 'download-git-repo'
import ora from 'ora'
import chalk from 'chalk'
import { format } from './time'

const spinner = ora()
spinner.color = 'green'
export interface GithubAPIReleaseData {
  html_url: string
  tag_name: string
  name: string
  target_commitish: string
  draft: boolean
  created_at: string
}

export interface APIReleaseData {
  version: string
  source: string
}

// 如何使用请访问：https://www.yinzhuoei.com/index.php/688.html
export const CDN_URL = 'http://patient-dawn-bb9c.seho.workers.dev'
export const API_URL = 'http://lucky-mountain-0caf.seho.workers.dev'
export const GITHUB_API_URL = 'https://api.github.com'
export const CNPM_URL = 'https://registry.npm.taobao.org'

export type ReturnGetReleaseList = {
  latest: GithubAPIReleaseData
  list: GithubAPIReleaseData[]
}

export type GetReleaseList = (params: { userName: string; projectName: string; targetBranch: string }) => Promise<ReturnGetReleaseList>

/**
 * @name 通过github-api获取release列表
 * @description 返回的zip链接会自动添加cdn
 * @param {{ reportUrl: string; targetBranch: string }} [params]
 */
export const getReleaseList: GetReleaseList = (params) => {
  const reportUrl = `${GITHUB_API_URL}/repos/${params.userName}/${params.projectName}/releases`
  return new Promise(async (resolve) => {
    const res = await flying.get<GithubAPIReleaseData[]>(reportUrl, {
      headers: {
        'User-Agent': randomUseragent.getRandom()
      }
    })
    // 过滤符合条件且取前30条记录
    res.data = res.data.filter((d) => !d.draft && d.target_commitish.includes(params.targetBranch)).slice(0, 30)
    resolve({
      latest: res.data[0],
      list: res.data.map((l) => {
        l.created_at = format(l.created_at)
        return l
      })
    })
  })
}

/**
 * @name 下载远端模板
 * @param {{ repository: string; }} params
 */
export const downloadTemplate = (params: { repository: string; projectName: string }): Promise<unknown> => {
  return new Promise((resolve) => {
    const { repository } = params
    download(repository, params.projectName, (err) => {
      if (!err) {
        resolve(null)
      } else {
        console.log(err)
        spinner.stop() // 停止
        console.log(chalk.red('拉取出现未知错误'))
      }
    })
  })
}
