#!/usr/bin/env node

import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs';
import { exec } from 'child_process';
import download from 'download-git-repo';
import chalk from 'chalk';
import handleEditor from './create/editor';
import handleCommitHook from './create/commitHook';
import handleEslint from './create/eslint';
import handlePrettierr from './create/prettierr';
import handleVscode from './create/vscode';

const spinner = ora('下载模板中, 请稍后...');

// 模板列表
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

// 定义功能的key数组
type FunctionKeys = 'editor' | 'commitHook' | 'eslint' | 'prettierr' | 'vscode';

// function功能列表
const functionsList: { name: string; value: FunctionKeys; checked: boolean }[] = [
  {
    name: 'editorconfig (统一IDE配置)',
    value: 'editor',
    checked: true
  },
  {
    name: 'husky & lint-staged git提交钩子',
    value: 'commitHook',
    checked: true
  },
  {
    name: 'eslint (如果已选择，那么git提交之前将会自动eslint)',
    value: 'eslint',
    checked: true
  },
  {
    name: 'prettierr (如果已选择，那么git提交之前将会自动prettierr)',
    value: 'prettierr',
    checked: true
  },
  {
    name: 'vscode相关配置 (setting + code-snippets)',
    value: 'vscode',
    checked: false
  }
];

// 功能列表的回调字典，这里是“递减”，即如果用户没有选择，那么就走对应的回调去删减配置
const functionsCallBack: Record<FunctionKeys, (params: EditTemplate) => void> = {
  editor: (params: EditTemplate) => handleEditor(params),
  commitHook: (params: EditTemplate) => handleCommitHook(params),
  eslint: (params: EditTemplate) => handleEslint(params),
  prettierr: (params: EditTemplate) => handlePrettierr(params),
  vscode: (params: EditTemplate) => handleVscode(params)
};

/**
 * @description 处理functions
 * @param params
 * @returns
 */
const handleFunctions = (params: { checkedfunctions: FunctionKeys[] } & EditTemplate): Promise<void> => {
  const { checkedfunctions } = params;
  return new Promise((resolve, reject) => {
    // 执行对应的回调函数
    try {
      checkedfunctions.map((c) => functionsCallBack[c](params));
    } catch (error) {
      reject(
        `处理用户选择的功能时出现了错误: ${error}; 请前往 https://github.com/seho-code-life/project_tool/issues/new 报告此错误; 但是这不影响你使用此模板，您可以自行删减功能`
      );
    }
    resolve();
  });
};

/**
 * @description 安装项目依赖
 * @param params
 */
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

/**
 * @description 修改下载好的模板package.json 以及处理functions
 * @param params
 */
const editPackageInfo = (params: { projectName: string; functions: FunctionKeys[] }) => {
  const { projectName, functions } = params;
  // 获取项目路径
  const path = `${process.cwd()}/${projectName}`;
  // 读取项目中的packagejson文件
  fs.readFile(`${path}/package.json`, async (err, data) => {
    if (err) throw err;
    // 获取json数据并修改项目名称和版本号
    const _data = JSON.parse(data.toString());
    // 修改package的name名称
    _data.name = projectName;
    // 处理functions, 去在模板中做一些其他操作，比如删除几行依赖/删除几个文件
    try {
      await handleFunctions({
        checkedfunctions: functions,
        package: _data,
        path
      });
    } catch (error) {
      spinner.text = `${error}`;
      spinner.fail();
    }
    const str = JSON.stringify(_data, null, 4);
    // 写入文件
    fs.writeFile(`${path}/package.json`, str, function (err) {
      if (err) throw err;
    });
    spinner.text = `下载完成, 正在自动安装项目依赖...`;
    // install({ projectName });
  });
};

/**
 * @description 下载模板
 * @param params
 */
const downloadTemplate = (params: { repository: string; projectName: string; functions: FunctionKeys[] }) => {
  const { repository, projectName, functions } = params;
  download(repository, projectName, (err) => {
    if (!err) {
      editPackageInfo({ projectName, functions });
    } else {
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
  },
  {
    type: 'checkbox',
    name: 'functions',
    choices: functionsList,
    message: '请选择默认安装的功能'
  }
];

type QuestionAnswers = {
  template: string;
  projectName: string;
  functions: FunctionKeys[];
};

inquirer.prompt(questions).then((answers: QuestionAnswers) => {
  // 获取答案
  const { template: templateUrl, projectName, functions } = answers;
  console.log(functions);
  spinner.start();
  spinner.color = 'green';
  // 开始下载模板
  downloadTemplate({
    repository: templateUrl,
    projectName,
    functions
  });
});
