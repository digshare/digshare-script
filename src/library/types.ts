/* eslint-disable @typescript-eslint/consistent-type-imports */

declare global {
  const {fetch, FormData, Headers, Request, Response}: typeof import('undici');
}

export {};
