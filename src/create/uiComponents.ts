import { QuestionAnswers } from './index'

interface UIComponents extends EditTemplate {
  name: QuestionAnswers['uiComponents']
}

const main = (template: UIComponents) => {
  // 构建一个依赖的字典，用于匹配依赖名称和对应的版本
  const dependencies: Record<UIComponents['name'], { name: string; version: string }> = {
    antdv: {
      name: 'ant-design-vue',
      version: '^2.2.8'
    },
    'element-plus': {
      name: 'element-plus',
      version: '1.2.0-beta.3'
    },
    vant: {
      name: 'vant',
      version: '3.2.8'
    }
  }
  template.package.dependencies = {
    ...template.package.dependencies,
    [dependencies[template.name].name]: dependencies[template.name].version
  }
  return template.package
}

export default main
