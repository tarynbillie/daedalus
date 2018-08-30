// @flow
import { BigNumber } from 'bignumber.js';
import { request } from './lib/request';
import { ETC_API_HOST, ETC_API_PORT } from './index';
import type { EtcTransactionParams, EtcTxHash } from './types';

type CommonParams = {
  ca: string,
  from: string,
  gas?: BigNumber,
  gasPrice?: BigNumber,
  gasLimit?: BigNumber,
  password: string,
};

export type PlainTransactionParams = CommonParams & {
  type: 'send_ether',
  to: string,
  value: BigNumber,
  password: string,
};

export type ContractDeploymentParams = CommonParams & {
  type: 'deploy_contract',
  data: string,
};

export type FunctionExecutionParams = CommonParams & {
  type: 'execute_function',
  to: string,
  data: string,
};

export type SendEtcTransactionParams =
  | PlainTransactionParams
  | ContractDeploymentParams
  | FunctionExecutionParams;

export const sendEtcTransaction = (params: SendEtcTransactionParams): Promise<EtcTxHash> => {
  const txParams: EtcTransactionParams = {
    from: params.from,
    to: params.type === 'send_ether' || params.type === 'execute_function' ? params.to : undefined,
    value: params.type === 'send_ether' ? params.value : new BigNumber(0),
    gasPrice: new BigNumber(params.gasPrice || 20000000000),
    gasLimit: params.gasLimit || new BigNumber(4700000),
    gas: params.gas || new BigNumber(4700000),
    data: params.type === 'send_ether' ? undefined : params.data,
  };

  return request(
    {
      hostname: ETC_API_HOST,
      method: 'POST',
      path: '/',
      port: ETC_API_PORT,
      ca: params.ca,
    },
    {
      jsonrpc: '2.0',
      method: 'personal_sendTransaction',
      params: [txParams, params.password],
    },
  );
};
