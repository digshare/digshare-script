import Chalk from 'chalk';
import QRCode from 'qrcode';

import type {Entrances} from '../@entrances.js';

export async function ensureAccessToken(entrances: Entrances): Promise<void> {
  const {api, config} = entrances;

  let {accessToken} = config;

  if (accessToken) {
    try {
      await api.call('/v2/script/access', {});
    } catch (error) {
      if (
        error instanceof Error &&
        /^(?:INVALID_ACCESS_TOKEN|PERMISSION_DENIED):/.test(error.message)
      ) {
        accessToken = undefined;
      } else {
        throw error;
      }
    }
  }

  if (!accessToken) {
    await connectScript(entrances);
  }
}

export async function connectScript(entrances: Entrances): Promise<void> {
  const {
    config,
    config: {
      endpoints: {auth: endpoint},
    },
    api,
  } = entrances;

  const {token} = await api.call<{
    token: string;
    expiresAt: string;
  }>(new URL('/api/v2/qr-code/create-token', endpoint), {
    action: 'connect-script-sdk',
  });

  const data = new URL(`script/sdk/connect/${token}`, endpoint).href;

  console.info('请使用盯梢应用扫描下方二维码完成授权：');
  console.info();

  const qrCodeString = await QRCode.toString(data, {
    type: 'terminal',
    small: true,
  });

  console.info(qrCodeString);

  const poll = api.poll<{stage: string; token: string}>(
    new URL('/api/v2/qr-code/get', endpoint),
    {token},
  );

  try {
    for await (const {stage, token} of poll) {
      switch (stage) {
        case 'pending-scan':
          break;
        case 'pending-confirmation':
          console.info('已扫描二维码，请选择频道完成授权。');
          break;
        case 'confirmed':
          config.setAccessToken(token);
          console.info('授权成功！');
          return;
      }
    }
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.startsWith('PERMISSION_DENIED:')
    ) {
      throw error;
    }

    console.info(Chalk.yellow('二维码已过期，请重新扫描。'));

    return connectScript(entrances);
  }

  await ensureAccessToken(entrances);
}
