#!/usr/bin/env node

import path from 'path';
import fs from 'fs';

const main = (): void => {
  const config = fs.readFileSync(path.resolve(__dirname, '..', 'template/editor/.editorconfig'));
  fs.writeFileSync('.editorconfig', config);
};

export default main;
