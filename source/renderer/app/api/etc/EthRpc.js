// @flow strict
import { BigNumber } from 'bignumber.js';
import { identity, pipe } from 'ramda';

import { bigNumberToHexString, hexStringToBigNumber, hexStringToNumber } from '../../utils/conversion';
import { mapLeafs, mapValues, whenMatching } from '../../utils/functor';
import { applyDefaults } from '../../utils/object';
import type {
  EtcTransaction, EtcTransactionParams,
  EtcTransactionReceipt,
  EtcTransactions,
  SendEtcTransactionParams,
} from './EtcTransaction';

import { request } from './lib/request';
import type {
  EtcAccountPassphrase,
  EtcAccounts,
  EtcBlockNumber,
  EtcBlockResponse,
  EtcSyncProgress,
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
        whenMatching(
          p => p instanceof Object,
          pipe(
            p => applyDefaults(desc.defaults, p),
            p => desc.order.map(n => p[n]),
            mapLeafs(whenMatching(BigNumber.isBigNumber, bigNumberToHexString)),
          ),
        ),
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
  daedalusChangePassphrase: RpcMethod<{ walletId: string, oldPassword: ?string, newPassword: ?string }, EtcAccountPassphrase> = this.method({
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
    { walletId: string, fromBlock: number, toBlock: number },
    EtcTransactions,
  > = this.method({
    name: 'daedalus_getAccountTransactions',
    order: ['walletId', 'fromBlock', 'toBlock'],
  });
  // endregion

  // region ETH methods
  ethBlockNumber: RpcMethod<void, EtcBlockNumber> = this.method({
    name: 'eth_blockNumber',
    order: [],
    deserialize: hexStringToNumber,
  });
  ethCall: RpcMethod<{
  tx: EtcTransactionParams,
  block: string,
}, string[]> = this.method({
    name: 'eth_call',
    order: ['tx', 'block'],
  });
  ethEstimateGas: RpcMethod<{ tx: $Shape<EtcTransactionParams> }, BigNumber> = this.method({
    name: 'eth_estimateGas',
    order: ['tx'],
    deserialize: hexStringToBigNumber,
  });
  ethGetBalance: RpcMethod<
    { walletId: string, status: 'latest' | 'earliest' | 'pending' },
    EtcWalletBalance,
  > = this.method({
    name: 'eth_getBalance',
    order: ['walletId', 'status'],
    deserialize: hexStringToBigNumber,
  });
  // TODO: verify typings and deserialization
  ethGetBlockByHash: RpcMethod<{
  blockHash: string,
  full?: boolean,
}, EtcBlockResponse> = this.method({
    name: 'eth_getBlockByHash',
    order: ['blockHash', 'full'],
    defaults: { full: true },
  });
  // TODO: verify typings and deserialization
  ethGetTransactionByHash: RpcMethod<{ txHash: string }, EtcTransaction> = this.method({
    name: 'eth_getTransactionByHash',
    order: ['txHash'],
  });
  // TODO: verify typings and deserialization
  ethGetTransactionReceipt: RpcMethod<{ txHash: string }, EtcTransactionReceipt> = this.method({
    name: 'eth_getTransactionReceipt',
    order: ['txHash'],
  });
  ethSyncing: RpcMethod<void, EtcSyncProgress> = this.method({
    name: 'eth_syncing',
    order: [],
    deserialize: x => (x ? mapValues(hexStringToBigNumber, x) : x),
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
  personalImportRawKey: RpcMethod<{ privateKey: string, password: ?string }, EtcWalletId> = this.method({
    name: 'personal_importRawKey',
    order: ['privateKey', 'password'],
    defaults: { password: '' },
  });
  personalListAccounts: RpcMethod<void, EtcAccounts> = this.method({
    name: 'personal_listAccounts',
    order: [],
  });
  personalSendTransaction: RpcMethod<{ tx: SendEtcTransactionParams, password: string }, EtcTxHash> = this.method({
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
