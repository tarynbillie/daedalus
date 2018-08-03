// @flow
import { BigNumber } from 'bignumber.js';

import { request } from './lib/request';
import { ETC_API_HOST, ETC_API_PORT } from './index';

export interface EthCallParams {
  ca: string;
  tx: {},
  block: string,
}

console.log('remove any');
export const ethCall = (params: any): Promise<any> =>
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
