#!/usr/bin/env node

// 命令行
import { program } from 'commander'
import { red } from 'chalk'
import leven from 'leven'
import pkg from '../package.json'
import welcome from './welcome.js'

// 输入-v， --version查看当前工具的版本
program.version(pkg.version, '-v, --version').description('查看当前版本号')

// 允许的command
type command = 'create' | 'workflow'
// command 处理函数
type CommandFunction = {
  [key in command]: () => Promise<void>
}

const commandFunction: CommandFunction = {
  create: async () => {
    // 引入欢迎👏页面
    await welcome()
    await import('./create.js')
  },
  workflow: async () => {
    // 引入欢迎👏页面
    await welcome()
    await import('./workflows.js')
  }
}
program.command('create').description('create template (创建模板)').action(commandFunction['create'])
program.command('workflow').description('create workflow (创建CI模板)').action(commandFunction['workflow'])

program.arguments('<command>').action((unknownCmd: string) => {
  // 获取允许的command
  const availableCommands = program.commands.map((cmd) => cmd.name())
  let suggestion = ''
  availableCommands.forEach((cmd) => {
    const currentMatch = leven(cmd, unknownCmd)
    const bestMatch = currentMatch < leven(suggestion || '', unknownCmd)
    if (currentMatch < 3 && bestMatch) {
      suggestion = cmd as command
    }
  })
  if (suggestion) {
    console.log(red(`你的意思是输入${suggestion}命令么？那我就按照${suggestion}处理了oh`))
    commandFunction[suggestion as command]()
  }
})

program.parse(process.argv)
