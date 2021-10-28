import figlet from 'figlet'

export default (): Promise<void> => {
  return new Promise((resolve) => {
    figlet('Enjoy For Seho', (err, data) => {
      console.log(`\n ${data} \n`)
      console.log('😄 模板内容来自于: https://github.com/seho-code-life/project_template')
      console.log('😼 欢迎提pr,issue,一起维护这个好用的东西')
      resolve()
    })
  })
}
