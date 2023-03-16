/* eslint-disable @typescript-eslint/consistent-type-imports */

import * as x from 'x-value';

declare global {
  const {fetch, FormData, Headers, Request, Response}: typeof import('undici');

  namespace XValue {
    interface Using extends x.UsingExtendedJSONValueMedium {}
  }
}
