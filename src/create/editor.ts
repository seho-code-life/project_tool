#!/usr/bin/env node

import path from 'path';
import fs from 'fs';

const main = (template: EditTemplate): CreateFunctionRes => {
  const { package: projectData } = template;
  const config = fs.readFileSync(path.resolve(__dirname, '..', 'template/editor/.editorconfig'));
  fs.writeFileSync('.editorconfig', config);
  return {
    projectData
  };
};

export default main;
