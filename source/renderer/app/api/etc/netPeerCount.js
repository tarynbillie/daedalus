// @flow
import { request } from './lib/request';
import { ETC_API_HOST, ETC_API_PORT } from './index';

export type NetPeerCountParams = {
  ca: string,
};

export const netPeerCount = (
  { ca }: NetPeerCountParams
): Promise<number> => (
  request({
    hostname: ETC_API_HOST,
    method: 'POST',
    path: '/',
    port: ETC_API_PORT,
    ca,
  }, {
    jsonrpc: '2.0',
    method: 'net_peerCount',
  })
);
