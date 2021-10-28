declare module 'download-git-repo' {
  export default function download(repository: string, projectName: string, callback: (err?: Error) => void): void
}
