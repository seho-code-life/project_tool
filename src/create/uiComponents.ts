import fs from 'fs'
import { QuestionAnswers } from './index'

interface UIComponents extends EditTemplate {
  name: QuestionAnswers['uiComponents']
}

// 构建一个依赖的字典，用于匹配依赖名称和对应的版本
const dependencies: Record<UIComponents['name'], { name: string; version: string; styleImport: string; componentsImport: string }> = {
  antdv: {
    name: 'ant-design-vue',
    version: '^2.2.8',
    styleImport: 'AndDesignVueResolve()',
    componentsImport: `AntDesignVueResolver({ importStyle: 'less' })`
  },
  'element-plus': {
    name: 'element-plus',
    version: '1.2.0-beta.3',
    styleImport: 'ElementPlusResolver()',
    componentsImport: 'ElementPlusResolver()'
  },
  vant: {
    name: 'vant',
    version: '3.2.8',
    styleImport: 'VantResolve()',
    componentsImport: 'VantResolver()'
  }
}

const main = (template: UIComponents) => {
  template.package.dependencies = {
    ...template.package.dependencies,
    [dependencies[template.name].name]: dependencies[template.name].version
  }
  // 处理vite-config-ts中的配置
  handleViteConfig(template.path, template.name)
  return template.package
}

// 处理vite-config-ts文件
export const handleViteConfig = (path: string, name: UIComponents['name']) => {
  const configPath = `${path}/vite.config.ts`
  // 判断是否存在vite-config-ts配置文件
  if (fs.existsSync(`${configPath}`)) {
    // 获取文件
    let viteConfigFile = fs.readFileSync(configPath).toString()
    // 替换components数组
    viteConfigFile = viteConfigFile.replace(/(?<=ViteComponents[\S\s]*resolvers.*\[).*(?=\])/, dependencies[name].componentsImport)
    // 替换style数组
    viteConfigFile = viteConfigFile.replace(/(?<=styleImport[\S\s]*resolvers.*\[).*(?=\])/, dependencies[name].styleImport)
    fs.writeFileSync(configPath, viteConfigFile)
  }
}

export default main
