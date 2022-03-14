export function devLog(...args: any[]): void {
  console.info(
    `\x1b[34m [dss-dev-run \x1b[0m${new Date().toLocaleTimeString()}\x1b[34m]\x1b[0m`,
    ...args,
  );
}

export function checkSize(value: any, max: number): void {
  if (Buffer.from(JSON.stringify(value)).length > max) {
    throw new Error(`value size is too large, max is ${max}`);
  }
}
