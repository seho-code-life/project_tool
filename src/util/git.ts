import flying from 'flyio'
import randomUseragent from 'random-useragent'
import { format } from './time'
import { hasProjectGit } from './index'

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
export const CDN_URL = 'http://github.cdn.yinzhuoei.com'
export const API_URL = 'http://github.api.yinzhuoei.com'
export const GITHUB_API_URL = 'https://api.github.com'
export const CNPM_URL = 'https://registry.npm.taobao.org'

/**
 * @name 通过github-api获取release列表
 * @description 返回的zip链接会自动添加cdn
 * @param {{ reportUrl: string; targetBranch: string }} [params]
 */
export const getReleaseList = (
  params: { reportUrl: string; targetBranch: string } = {
    reportUrl: `${GITHUB_API_URL}/repos/seho-code-life/project_template/releases`,
    targetBranch: 'base-template'
  }
): Promise<{
  latest: GithubAPIReleaseData
  list: GithubAPIReleaseData[]
}> => {
  return new Promise(async (resolve) => {
    const res = await flying.get<GithubAPIReleaseData[]>(params.reportUrl + `?per_page=30`, {
      headers: {
        'User-Agent': randomUseragent.getRandom()
      }
    })
    resolve({
      latest: res.data[0],
      list: res.data
        .filter((d) => !d.draft && d.target_commitish === params.targetBranch)
        .map((l) => {
          l.created_at = format(l.created_at)
          return l
        })
    })
  })
}

/**
 *
 * @name 通过api获取最新版本的信息
 * @param {{ reportUrl: string }} [params]
 */
export const getLatestRelease = (params: { reportUrl: string } = { reportUrl: 'seho-code-life/project_template' }): Promise<APIReleaseData> => {
  return new Promise(async (resolve) => {
    const res = await flying.get(`${API_URL}/repo/${params.reportUrl}/info`)
    const data = JSON.parse(res.data)
    resolve({
      version: data.version,
      source: `${CDN_URL}/${data.source}`
    })
  })
}
