#!/usr/bin/env node
var j=Object.create;var c=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var N=Object.getOwnPropertyNames;var w=Object.getPrototypeOf,x=Object.prototype.hasOwnProperty;var y=e=>c(e,"__esModule",{value:!0});var $=(e,t,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of N(t))!x.call(e,r)&&r!=="default"&&c(e,r,{get:()=>t[r],enumerable:!(o=v(t,r))||o.enumerable});return e},n=e=>$(y(c(e!=null?j(w(e)):{},"default",e&&e.__esModule&&"default"in e?{get:()=>e.default,enumerable:!0}:{value:e,enumerable:!0})),e);var l=n(require("inquirer")),d=n(require("ora")),a=n(require("fs")),f=n(require("child_process")),u=n(require("download-git-repo")),g=n(require("chalk"));const s=(0,d.default)("\u4E0B\u8F7D\u6A21\u677F\u4E2D, \u8BF7\u7A0D\u540E..."),_=[{name:"vue3-vite2-ts-template \uFF08ant-design-vue\uFF09\u6A21\u677F\u6587\u6863: https://github.com/seho-code-life/project_template/tree/vue3-vite2-ts-template(release)",value:"seho-code-life/project_template#vue3-vite2-ts-template(release)"},{name:"node-command-ts-template                 \u6A21\u677F\u6587\u6863: https://github.com/seho-code-life/project_template/tree/node-command-cli",value:"seho-code-life/project_template#node-command-cli"}],k=e=>{const{projectName:t}=e;s.text="\u6B63\u5728\u5B89\u88C5\u4F9D\u8D56\uFF0C\u5982\u679C\u60A8\u7684\u7F51\u7EDC\u60C5\u51B5\u8F83\u5DEE\uFF0C\u8FD9\u53EF\u80FD\u662F\u4E00\u676F\u8336\u7684\u529F\u592B",(0,f.exec)(`cd ${t} && npm i`,(o,r,i)=>{if(o){console.error(`exec error: ${o}`);return}else r?(s.text=`\u5B89\u88C5\u6210\u529F, \u8FDB\u5165${t}\u5F00\u59CB\u64B8\u7801\uFF5E`,s.succeed()):(s.text="\u81EA\u52A8\u5B89\u88C5\u5931\u8D25, \u8BF7\u67E5\u770B\u9519\u8BEF\uFF0C\u4E14\u4E4B\u540E\u81EA\u884C\u5B89\u88C5\u4F9D\u8D56\uFF5E",s.fail(),console.error(i))})},S=e=>{const{projectName:t}=e,o=`${process.cwd()}/${t}`;a.default.readFile(`${o}/package.json`,(r,i)=>{if(r)throw r;const m=JSON.parse(i.toString());m.name=t;const h=JSON.stringify(m,null,4);a.default.writeFile(`${o}/package.json`,h,function(p){if(p)throw p}),s.text="\u4E0B\u8F7D\u5B8C\u6210, \u6B63\u5728\u81EA\u52A8\u5B89\u88C5\u9879\u76EE\u4F9D\u8D56...",k({projectName:t})})},b=e=>{const{repository:t,projectName:o}=e;(0,u.default)(t,o,r=>{r?(console.log(r),s.stop(),console.log(g.default.red("\u62C9\u53D6\u6A21\u677F\u51FA\u73B0\u672A\u77E5\u9519\u8BEF"))):S({projectName:o})})},q=[{type:"input",name:"projectName",message:"\u9879\u76EE\u6587\u4EF6\u5939\u540D\u79F0:",validate(e){return e?a.default.existsSync(e)?"\u6587\u4EF6\u5DF2\u5B58\u5728":!0:"\u8BF7\u8F93\u5165\u6587\u4EF6\u540D"}},{type:"list",name:"template",choices:_,message:"\u8BF7\u9009\u62E9\u8981\u62C9\u53D6\u7684\u6A21\u677F"}];l.default.prompt(q).then(e=>{const{template:t,projectName:o}=e;s.start(),s.color="green",b({repository:t,projectName:o})});
