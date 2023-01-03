const DEBUG = true;

export default {
  log: (...args: any[]) => DEBUG && console.log(...args),
  info: (...args: any[]) => DEBUG && console.info(...args),
  warn: (...args: any[]) => DEBUG && console.warn(...args),
  error: (...args: any[]) => DEBUG && console.error(...args),
  execute: (cb: () => void) => DEBUG && cb(),
};
