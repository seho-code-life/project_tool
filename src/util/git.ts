import flying from 'flyio'
import randomUseragent from 'random-useragent'
import { format } from './time'

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

/**
 * @name 通过github-api获取release列表
 * @description 返回的zip链接会自动添加cdn
 * @param {{ reportUrl: string; targetBranch: string }} [params]
 */
export const getReleaseList = (params: {
  targetBranch: string | null
}): Promise<{
  latest: GithubAPIReleaseData
  list: GithubAPIReleaseData[]
}> => {
  const reportUrl = `${GITHUB_API_URL}/repos/seho-code-life/project_template/releases`
  return new Promise(async (resolve) => {
    const res = await flying.get<GithubAPIReleaseData[]>(reportUrl, {
      headers: {
        'User-Agent': randomUseragent.getRandom()
      }
    })
    // 过滤符合条件且取前30条记录
    res.data = res.data.filter((d) => !d.draft && d.target_commitish.includes(params.targetBranch || 'base-template')).slice(0, 30)
    resolve({
      latest: res.data[0],
      list: res.data.map((l) => {
        l.created_at = format(l.created_at)
        return l
      })
    })
  })
}
