export default function (appName: string): bigint  {
  let result = ''
  for (let i = 0; i < appName.length; i++) {
    result += appName.charCodeAt(i).toString(16)
  }
  return BigInt(parseInt(result, 16))
}