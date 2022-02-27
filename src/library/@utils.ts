export function devLog(...args: any[]): void {
  console.info(
    `\x1b[34m [dss-dev-run \x1b[0m${new Date().toLocaleTimeString()}\x1b[34m]\x1b[0m`,
    ...args,
  );
}
