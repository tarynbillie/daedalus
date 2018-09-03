// @flow strict
import { BigNumber } from 'bignumber.js';

import type { EtcBlockNumber, EtcGas, EtcGasPrice, EtcTxHash, EtcWalletId } from './types';

export type EtcTransaction = {
  hash: EtcTxHash,
  nonce: string,
  blockHash: string,
  blockNumber: EtcBlockNumber,
  transactionIndex: string,
  from: EtcWalletId,
  to: EtcWalletId,
  value: string,
  gasPrice: EtcGasPrice,
  gas: EtcGas,
  input: string,
  pending: boolean,
  isOutgoing: boolean,
};

export type EtcTransactionParams = {
  from?: string,
  to?: string,
  value?: BigNumber,
  gasPrice?: BigNumber,
  gasLimit?: BigNumber,
  gas: BigNumber,
  data?: string,
};

export type EtcTransactions = {
  transactions: Array<EtcTransaction>,
};

type CommonParams = {
  from: string,
  gas?: BigNumber,
  gasPrice?: BigNumber,
  gasLimit?: BigNumber,
};

export type PlainTransactionParams = {
  type: 'send_ether',
  to: string,
  value: BigNumber,
} & CommonParams;

export type ContractDeploymentParams = {
  type: 'deploy_contract',
  data: string,
} & CommonParams;

export type FunctionExecutionParams = {
  type: 'execute_function',
  to: string,
  data: string,
} & CommonParams;

export type SendEtcTransactionParams = PlainTransactionParams | ContractDeploymentParams | FunctionExecutionParams;

export const withGas = (gas: BigNumber) => <T: CommonParams>(params: T): T => ({ ...params, gas });

export type EtcTransactionReceipt = ?{
  transactionHash: string,
  transactionIndex: BigNumber,
  blockNumber: BigNumber,
  blockHash: string,
  cumulativeGasUsed: BigNumber,
  gasUsed: BigNumber,
  contractAddress: ?string,
  logs: Array<TxLog>,
};

export type TxLog = {
  logIndex: BigNumber,
  transactionIndex: BigNumber,
  transactionHash: string,
  blockHash: string,
  blockNumber: BigNumber,
  address: string,
  data: string,
  topics: string[],
};
