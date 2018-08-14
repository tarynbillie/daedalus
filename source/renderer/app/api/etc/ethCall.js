// @flow
import { request } from './lib/request';
import { ETC_API_HOST, ETC_API_PORT } from './index';
import type { EtcTransactionParams } from './types';

export interface EthCallParams {
  ca: string;
  tx: EtcTransactionParams,
  block: string,
}

export const ethCall = (params: EthCallParams): Promise<string[]> =>
  request({
    hostname: ETC_API_HOST,
    method: 'POST',
    path: '/',
    port: ETC_API_PORT,
    ca: params.ca,
  }, {
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [params.tx, params.block]
  });
