export const format = (date: string) => {
  const result = new Date(date)
  return `${result.getFullYear()}-${result.getMonth() + 1}-${result.getDate()}`
}
