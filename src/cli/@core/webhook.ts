import type {Entrances} from '../@entrances.js';

export interface GetWebhookOptions {
  debug: boolean;
  reset: boolean;
}

export async function getWebhook(
  entrances: Entrances,
  {debug, reset}: GetWebhookOptions,
): Promise<void> {
  const {api} = entrances;

  const {url} = await api.call<{url: string}>('/v2/script/get-webhook', {
    debug,
    reset,
  });

  console.info(
    '获取成功。如果您不小心泄露了 webhook，可以使用 --reset 选项重置。',
  );

  console.info(url);
}
