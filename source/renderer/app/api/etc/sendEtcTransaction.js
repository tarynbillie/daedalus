// @flow
import BigNumber from 'bignumber.js';
import { request } from './lib/request';
import { ETC_API_HOST, ETC_API_PORT } from './index';
import type { EtcTxHash } from './types';

type CommonParams = {
  ca: string,
  from: string,
  gas?: BigNumber,
  gasPrice?: BigNumber,
  gasLimit?: BigNumber,
  password: string,
}

export type PlainTransactionParams = CommonParams & {
  type: 'send_ether',
  to: string,
  value: BigNumber,
  password: string,
}

export type ContractDeploymentParams = CommonParams & {
  type: 'deploy_contract',
  password: string,
  data: string,
}

export type SendEtcTransactionParams = PlainTransactionParams | ContractDeploymentParams;

export const sendEtcTransaction = (
  params: SendEtcTransactionParams
): Promise<EtcTxHash> => {
  console.log('input params', params);

  const txParams = {
    from: params.from,
    to: params.type === 'send_ether' ? params.to : undefined,
    value: '0x' + (params.type === 'send_ether' ? params.value : new BigNumber(0)).toString(16),
    gasPrice: '0x' + new BigNumber(params.gasPrice || 20000000000).toString(16),
    gasLimit: '0x' + (params.gasLimit || new BigNumber(4700000)).toString(16),
    gas: '0x' + (params.gas || new BigNumber(4700000)).toString(16),
    data: params.type === 'send_ether' ? undefined : params.data,
  };

  console.log('sendTransactionRequest', txParams);

  return (
    request({
      hostname: ETC_API_HOST,
      method: 'POST',
      path: '/',
      port: ETC_API_PORT,
      ca: params.ca,
    }, {
      jsonrpc: '2.0',
      method: 'personal_sendTransaction',
      params: [
        txParams,
        params.password,
      ]
    })
  );
};
