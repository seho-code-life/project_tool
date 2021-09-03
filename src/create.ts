#!/usr/bin/env node

import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs';
import { exec } from 'child_process';
import download from 'download-git-repo';
import chalk from 'chalk';

const spinner = ora('下载模板中, 请稍后...');

// 模板字典
const template: { name: string; value: string }[] = [
  {
    name: 'vue3-vite2-ts-template （ant-design-vue）模板文档: https://github.com/seho-code-life/project_template/tree/vue3-vite2-ts-template(release)',
    value: 'seho-code-life/project_template#vue3-vite2-ts-template(release)'
  },
  {
    name: 'node-command-ts-template                 模板文档: https://github.com/seho-code-life/project_template/tree/node-command-cli',
    value: 'seho-code-life/project_template#node-command-cli'
  }
];

// 安装项目依赖
const install = (params: { projectName: string }) => {
  const { projectName } = params;
  spinner.text = '正在安装依赖，如果您的网络情况较差，这可能是一杯茶的功夫';
  // 执行install
  exec(`cd ${projectName} && npm i`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    } else if (stdout) {
      spinner.text = `安装成功, 进入${projectName}开始撸码～`;
      spinner.succeed();
    } else {
      spinner.text = `自动安装失败, 请查看错误，且之后自行安装依赖～`;
      spinner.fail();
      console.error(stderr);
    }
  });
};

// 修改下载好的模板package.json
const editPackageInfo = (params: { projectName: string }) => {
  const { projectName } = params;
  // 获取项目路径
  const path = `${process.cwd()}/${projectName}`;
  // 读取项目中的packagejson文件
  fs.readFile(`${path}/package.json`, (err, data) => {
    if (err) throw err;
    // 获取json数据并修改项目名称和版本号
    const _data = JSON.parse(data.toString());
    // 修改package的name名称
    _data.name = projectName;
    const str = JSON.stringify(_data, null, 4);
    // 写入文件
    fs.writeFile(`${path}/package.json`, str, function (err) {
      if (err) throw err;
    });
    spinner.text = `下载完成, 正在自动安装项目依赖...`;
    install({ projectName });
  });
};

// 下载模板
const downloadTemplate = (params: { repository: string; projectName: string }) => {
  const { repository, projectName } = params;
  download(repository, projectName, (err) => {
    if (!err) {
      editPackageInfo({ projectName });
    } else {
      console.log(err);
      spinner.stop(); // 停止
      console.log(chalk.red('拉取模板出现未知错误'));
    }
  });
};

// 定义问题列表
const questions = [
  {
    type: 'input',
    name: 'projectName',
    message: '项目文件夹名称:',
    validate(val?: string) {
      if (!val) {
        // 验证一下输入是否正确
        return '请输入文件名';
      }
      if (fs.existsSync(val)) {
        // 判断文件是否存在
        return '文件已存在';
      } else {
        return true;
      }
    }
  },
  {
    type: 'list',
    name: 'template',
    choices: template,
    message: '请选择要拉取的模板'
  }
];

inquirer.prompt(questions).then((answers) => {
  // 获取答案
  const { template: templateUrl, projectName } = answers;
  spinner.start();
  spinner.color = 'green';
  // 开始下载模板
  downloadTemplate({
    repository: templateUrl,
    projectName
  });
});
