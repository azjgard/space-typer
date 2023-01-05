export default (debug: boolean) => ({
  log: (...args: any[]) => debug && console.log(...args),
  info: (...args: any[]) => debug && console.info(...args),
  warn: (...args: any[]) => debug && console.warn(...args),
  error: (...args: any[]) => debug && console.error(...args),
  execute: (cb: () => void) => debug && cb(),
});
