const DEBUG = true;

export default {
  log: (...args: any[]) => DEBUG && console.log(...args),
  warn: (...args: any[]) => DEBUG && console.warn(...args),
  error: (...args: any[]) => DEBUG && console.error(...args),
  execute: (cb: () => void) => DEBUG && cb(),
};
