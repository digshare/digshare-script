/* eslint-disable @typescript-eslint/consistent-type-imports */

declare global {
  export const {
    fetch,
    FormData,
    Headers,
    Request,
    Response,
  }: typeof import('undici');
}

export {};
