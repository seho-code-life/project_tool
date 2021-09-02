#!/usr/bin/env node

import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs';
import download from 'download-git-repo';
import chalk from 'chalk';

const spinner = ora('下载模板中, 请稍后...');

// 模板字典
const template = {
  name: 'vue3-vite2-ts-template （ant-design-vue）',
  url: 'https://github.com/seho-code-life/project_template/tree/vue3-vite2-ts-template(release)'
};

// 修改下载好的模板package.json
const editPackageInfo = function (params: { projectName: string }) {
  const { projectName } = params;
  // 读取文件
  fs.readFile(`${process.cwd()}/${projectName}/package.json`, (err, data) => {
    if (err) throw err;
    // 获取json数据并修改项目名称和版本号
    const _data = JSON.parse(data.toString());
    // 修改package的name名称
    _data.name = projectName;
    const str = JSON.stringify(_data, null, 4);
    // 写入文件
    fs.writeFile(`${process.cwd()}/${projectName}/package.json`, str, function (err) {
      if (err) throw err;
    });
    spinner.text = `安装完成, cd ${projectName} 进入开发～`;
    spinner.succeed();
  });
};

// 下载模板
const downloadTemplate = function ({ repository, projectName }) {
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
    validate(val) {
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
