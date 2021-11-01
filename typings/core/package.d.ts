declare interface PackageData {
  version: string
  name: string
  scripts: {
    dev: string
    'dev:test': string
    'dev:prod': string
    'dev:build': string
    'build:test': string
    'build:prod': string
    serve: string
    [propsName: string]: string
  }
  'lint-staged'?: Record<'*.{ts,tsx}' | '*.{json,js,jsx}' | '*.vue', string[]>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}
