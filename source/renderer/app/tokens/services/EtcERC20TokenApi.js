// @flow
import { BigNumber } from 'bignumber.js';
import Maybe from 'data.maybe';
import { remote } from 'electron';
import { merge, pipe, prop, propEq, reduce, replace, find, map } from 'ramda';
import { interval } from 'rxjs';
import { concatMap, filter, take } from 'rxjs/operators';
import abiCoder from 'web3-eth-abi';

import { ethCall } from '../../api/etc/ethCall';
import { getEtcEstimatedGas } from '../../api/etc/getEtcEstimatedGas';
import { getEtcTransactionByHash } from '../../api/etc/getEtcTransaction';
import { getTransactionReceipt } from '../../api/etc/getEtcTransactionReceipt';
import { sendEtcTransaction } from '../../api/etc/sendEtcTransaction';
import type { EtcTransaction } from '../../api/etc/types';
import type { Dict } from '../../utils';
import { findMaybe, toDict, toNothing, traverse } from '../../utils';
import { prefixWith } from '../../utils/strings';
import { erc20Abi } from '../data/ERC20Abi';
import type { ContractFunctionAbi } from '../models/Abi';
import { onlyEvents, onlyFunctions, topicOf } from '../models/Abi';
import type { ERC20Meta } from '../models/ERC20';
import { isValidERC20 } from '../models/ERC20';
import type { Receipt } from '../models/Receipt';

const ca = remote.getGlobal('ca');

const TRANSFER_EVENT_NAME = 'Transfer';
const TRANSACTION_POLL_INTERVAL = 1000;

const padAddressTo64Bytes = pipe(
  replace('0x', ''),
  x => x.padStart(64, '0'),
  prefixWith('0x')
);

export type ERC20Check = ERC20Meta & {
  isERC20: boolean
};

export class EtcERC20TokenApi {
  functionAbis: Dict<ContractFunctionAbi> = toDict(prop('name'), onlyFunctions(erc20Abi));

  async checkIfERC20Token(contractAddress: string, caller: string): Promise<ERC20Check> {
    const getProperty = <K: string>(name: K): Promise<$Shape<ERC20Meta>> => {
      // $FlowIssue, again...
      let valuePromise: Promise<$PropertyType<ERC20Meta, K>>;
      if (name === 'allowance') {
        valuePromise = this.getAllowance(contractAddress, caller, caller);
      } else if (name === 'balanceOf') {
        valuePromise = this.getBalanceOf(contractAddress, caller);
      } else {
        valuePromise = this._getProperty(contractAddress, name);
      }

      return valuePromise.then(Maybe.of, toNothing).then(value => ({ [name]: value }));
    };

    return traverse(getProperty)([
      'name',
      'symbol',
      'decimals',
      'totalSupply',
      'allowance',
      'balanceOf'
    ])
      .then(reduce(merge))
      .then((meta: ERC20Meta) => ({ ...meta, isERC20: isValidERC20(meta) }));
  }

  getName(contractAddress: string): Promise<string> {
    return this._getProperty(contractAddress, 'name');
  }

  getSymbol(contractAddress: string): Promise<string> {
    return this._getProperty(contractAddress, 'symbol');
  }

  getDecimals(contractAddress: string): Promise<number> {
    return this._getProperty(contractAddress, 'decimals');
  }

  getTotalSupply(contractAddress: string): Promise<number> {
    return this._getProperty(contractAddress, 'totalSupply');
  }

  getAllowance(contractAddress: string, from: string, to: string): Promise<number> {
    return this._callContract(contractAddress, 'allowance', [from, to]);
  }

  getBalanceOf(contractAddress: string, accountAddress: string): Promise<number> {
    return this._callContract(contractAddress, 'balanceOf', [accountAddress]).then(
      result => result[0]
    );
  }

  sendTokens(
    contractAddress: string,
    senderAddress: string,
    amount: number,
    receiverAddress: string
  ): Promise<boolean> {
    const transferEventTopic = pipe(
      onlyEvents,
      findMaybe(propEq('name', TRANSFER_EVENT_NAME)),
      x => x.map(topicOf).get()
      )(erc20Abi);
    const expectedTransferEvent = [
      transferEventTopic,
      padAddressTo64Bytes(senderAddress),
      padAddressTo64Bytes(receiverAddress)
    ];

    return this._executeContractFunction(contractAddress, senderAddress, 'transfer', [
      receiverAddress,
      amount
    ]).then(({ receipt }) => receipt.logs.some(propEq('topics', expectedTransferEvent)));
  }

  _buildCallData(methodName: string, params: any[]): string {
    return abiCoder.encodeFunctionCall(this.functionAbis[methodName], params);
  }

  _getGasEstimation(data: string) {
    return getEtcEstimatedGas({ data, ca, value: 0, gasPrice: 20000000000 });
  }

  _getProperty<T>(contractAddress: string, property: string): Promise<T> {
    return this._callContract(contractAddress, property).then((result: [T]) => result[0]);
  }

  _callContract<T>(address: string, methodName: string, params: any[] = []): Promise<T> {
    const callData = this._buildCallData(methodName, params);

    return this._getGasEstimation(callData)
      .then(gasEstimation => ({
        to: address,
        gas: gasEstimation,
        data: callData
      }))
      .then(tx => ethCall({ ca, tx, block: 'latest' }))
      .then(result => abiCoder.decodeParameters(this.functionAbis[methodName].outputs, result));
  }

  _executeContractFunction(
    address: string,
    from: string,
    methodName: string,
    params: any[] = []
  ): Promise<{ transaction: EtcTransaction, receipt: Receipt }> {
    const callData = this._buildCallData(methodName, params);

    return this._getGasEstimation(callData)
      .then(gasEstimation =>
        sendEtcTransaction({
          type: 'execute_function',
          ca,
          block: 'latest',
          to: address,
          from,
          gas: new BigNumber(gasEstimation),
          password: '',
          data: callData
        })
      )
      .then(this._pollForReceipt);
  }

  _pollForReceipt = (txHash: string): Promise<{ transaction: EtcTransaction, receipt: Receipt }> =>
    interval(TRANSACTION_POLL_INTERVAL)
      .pipe(
        concatMap(() => getEtcTransactionByHash({ ca, txHash })),
        filter(tx => !!tx.blockHash),
        concatMap(transaction =>
          getTransactionReceipt({ ca, txHash }).then(receipt => ({
            transaction,
            receipt
          }))
        ),
        take(1)
      )
      .toPromise();
}
