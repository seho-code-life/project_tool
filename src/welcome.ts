import figlet from 'figlet'

export default (): Promise<void> => {
  return new Promise((resolve) => {
    figlet('Enjoy For Seho', (err, data) => {
      console.log(`\n ${data} \n`)
      console.log('📖 项目模板内容来自于: https://github.com/seho-code-life/project_template')
      console.log('🔧 CI模板内容来自于: https://github.com/seho-code-life/project_workflows')
      console.log('🌈 欢迎阅读本篇文章,介绍了此项目解决了哪些前端问题 https://www.yinzhuoei.com/index.php/archives/686/')
      console.log('😼 欢迎提pr,issue,一起维护这个好用的东西')
      console.log('')
      resolve()
    })
  })
}
