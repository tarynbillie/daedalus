// @flow strict
import { BigNumber } from 'bignumber.js';
import { identity } from 'ramda';

import { pass } from '../../utils';
import { bigNumberToHexString, hexStringToNumber } from '../../utils/formatters';
import { mapMatching } from '../../utils/functor';
import { applyDefaults } from '../../utils/object';

import type { ChangeEtcAccountPassphraseParams } from './changeEtcAccountPassphrase';
import type { CreateEtcAccountParams } from './createEtcAccount';
import type { EthCallParams } from './ethCall';
import type { GetEtcAccountBalanceParams } from './getEtcAccountBalance';
import type { GetEtcBlockByHashParams } from './getEtcBlock';
import type { GetEtcBlockNumberParams } from './getEtcBlockNumber';
import type { GetEtcTransactionsParams } from './getEtcTransactions';
import { request } from './lib/request';
import type { SendEtcTransactionParams } from './sendEtcTransaction';
import type {
  EtcAccountPassphrase,
  EtcAccounts,
  EtcBlock,
  EtcBlockNumber,
  EtcGas,
  EtcSyncProgress,
  EtcTransaction,
  EtcTransactionParams,
  EtcTransactions,
  EtcTxHash,
  EtcWalletBalance,
  EtcWalletId,
} from './types';

type RpcMethod<In, Out> = (params: In) => Promise<Out>;

// TODO: increase type safety by converting this type into intersection of required and optionals
type MethodDescriptor<In, Out, Request = In, Response = Out> = {
  name: string,
  order: Array<$Keys<Request & {}>>,
  defaults?: $Shape<Request & {}>,
  serialize?: In => Request | Promise<Request>,
  deserialize?: Response => Out | Promise<Out>,
};

const defaultsForMethodDescriptor = (): $Shape<MethodDescriptor<*, *, *, *>> => ({ defaults: {} });

export class EthRpc {
  _request: typeof request;
  _ca: string;
  _host: string;
  _port: number;

  constructor(doRequest: typeof request, ca: string, host: string, port: number) {
    this._request = doRequest;
    this._ca = ca;
    this._host = host;
    this._port = port;
  }

  method = <In, Out, Request, Response>(
    descriptor: MethodDescriptor<In, Out, Request, Response>,
  ): RpcMethod<In, Out> => (params: In): Promise<Out> => {
    const desc = applyDefaults(defaultsForMethodDescriptor(), descriptor);

    return Promise.resolve(params)
      .then(desc.serialize || identity)
      .then(
        parameters =>
          parameters instanceof Object
            ? pass(parameters)(
                p => applyDefaults(desc.defaults, p),
                p => desc.order.map(n => p[n]),
                mapMatching(BigNumber.isBigNumber, bigNumberToHexString),
              )
            : parameters,
      )
      .then(parameters =>
        this._request(
          {
            hostname: this._host,
            method: 'POST',
            path: '/',
            port: this._port,
            ca: this._ca,
          },
          {
            jsonrpc: '2.0',
            method: desc.name,
            params: parameters,
          },
        ),
      )
      .then(desc.deserialize || identity);
  };

  // region Daedalus methods
  daedalusChangePassphrase: RpcMethod<
    ChangeEtcAccountPassphraseParams,
    EtcAccountPassphrase,
  > = this.method({
    name: 'daedalus_changePassphrase',
    order: ['walletId', 'oldPassword', 'newPassword'],
    defaults: {
      oldPassword: '',
      newPassword: '',
    },
  });
  daedalusDeleteWallet: RpcMethod<{ walletAddress: string }, boolean> = this.method({
    name: 'daedalus_deleteWallet',
    order: ['walletAddress'],
  });
  daedalusGetAccountTransactions: RpcMethod<
    GetEtcTransactionsParams,
    EtcTransactions,
  > = this.method({
    name: 'daedalus_getAccountTransactions',
    order: ['walletId', 'fromBlock', 'toBlock'],
  });
  // endregion

  // region ETH methods
  ethBlockNumber: RpcMethod<GetEtcBlockNumberParams, EtcBlockNumber> = this.method({
    name: 'eth_blockNumber',
    order: [],
    deserialize: hexStringToNumber,
  });
  ethCall: RpcMethod<EthCallParams, string[]> = this.method({
    name: 'eth_call',
    order: ['tx', 'block'],
  });
  ethEstimateGas: RpcMethod<{ tx: $Shape<EtcTransactionParams> }, EtcGas> = this.method({
    name: 'eth_estimateGas',
    order: ['tx'],
  });
  ethGetBalance: RpcMethod<GetEtcAccountBalanceParams, EtcWalletBalance> = this.method({
    name: 'eth_getBalance',
    order: ['walletId', 'status'],
  });
  ethGetBlockByHash: RpcMethod<GetEtcBlockByHashParams, EtcBlock> = this.method({
    name: 'eth_getBlockByHash',
    order: ['blockHash', 'full'],
    defaults: { full: true },
  });
  ethGetTransactionByHash: RpcMethod<{ txHash: string }, EtcTransaction> = this.method({
    name: 'eth_getTransactionByHash',
    order: ['txHash'],
  });
  ethGetTransactionReceipt: RpcMethod<{ txHash: string }, EtcTransaction> = this.method({
    name: 'eth_getTransactionReceipt',
    order: ['txHash'],
  });
  ethSyncing: RpcMethod<void, EtcSyncProgress> = this.method({
    name: 'eth_syncing',
    order: [],
  });
  // endregion

  // region Net methods
  netPeerCount: RpcMethod<void, number> = this.method({
    name: 'net_peerCount',
    order: [],
    deserialize: hexStringToNumber,
  });
  // endregion

  // region Personal methods
  personalImportRawKey: RpcMethod<CreateEtcAccountParams, EtcWalletId> = this.method({
    name: 'personal_importRawKey',
    order: ['privateKey', 'password'],
    defaults: { password: '' },
  });
  personalListAccounts: RpcMethod<void, EtcAccounts> = this.method({
    name: 'personal_listAccounts',
    order: [],
  });
  personalSendTransaction: RpcMethod<
    { tx: SendEtcTransactionParams, password: string },
    EtcTxHash,
  > = this.method({
    name: 'personal_sendTransaction',
    order: ['tx', 'password'],
    // TODO: refactor to apply defaults instead of have this messed up here
    serialize: ({ tx, password }): { tx: EtcTransactionParams, password: string } => ({
      tx: {
        from: tx.from,
        to: tx.type === 'send_ether' || tx.type === 'execute_function' ? tx.to : undefined,
        value: tx.type === 'send_ether' ? tx.value : new BigNumber(0),
        gasPrice: new BigNumber(tx.gasPrice || 20000000000),
        gasLimit: tx.gasLimit || new BigNumber(4700000),
        gas: tx.gas || new BigNumber(4700000),
        data: tx.type === 'send_ether' ? undefined : tx.data,
      },
      password,
    }),
  });
  // endregion
}
