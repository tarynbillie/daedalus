// @flow
import { request } from './lib/request';
import { ETC_API_HOST, ETC_API_PORT } from './index';

export type GetTransactionReceiptParams = {
  ca: string,
  txHash: string,
}

export const getTransactionReceipt = ({ ca, txHash }: GetTransactionReceiptParams) =>
  request({
    hostname: ETC_API_HOST,
    method: 'POST',
    path: '/',
    port: ETC_API_PORT,
    ca,
  }, {
    jsonrpc: '2.0',
    method: 'eth_getTransactionReceipt',
    params: [txHash]
  });
