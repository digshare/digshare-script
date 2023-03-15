import * as HTTP from 'http';
import type * as Net from 'net';

import open from 'open';

import type {Entrances} from '../@entrances';

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
  } = entrances;

  await new Promise<void>(resolve => {
    const server = HTTP.createServer((request, response) => {
      response.writeHead(200, {
        'access-control-allow-origin': '*',
      });
      response.end();

      if (request.method !== 'GET') {
        return;
      }

      const url = new URL(request.url!, 'protocol://hostname');

      const token = url.searchParams.get('token');

      if (token) {
        server.close();

        config.setAccessToken(token);

        console.info('授权成功！');

        resolve();
      }
    });

    server.listen(() => {
      const {port} = server.address() as Net.AddressInfo;

      const url = `${endpoint}/script/sdk/connect?port=${port}`;

      console.info('正在打开授权页面：');
      console.info(url);

      void open(url);
    });
  });

  await ensureAccessToken(entrances);
}
