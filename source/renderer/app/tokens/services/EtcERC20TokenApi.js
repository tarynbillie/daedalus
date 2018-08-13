// @flow
import { BigNumber } from 'bignumber.js';
import Maybe from 'data.maybe';
import { remote } from 'electron';
import erc20Abi from 'human-standard-token-abi';
import { filter as rfilter, fromPairs, pipe, prop, propEq, replace } from 'ramda';
import { interval } from 'rxjs';
import { concatMap, filter, pluck, take } from 'rxjs/operators';
import abiCoder from 'web3-eth-abi';

import { ethCall } from '../../api/etc/ethCall';
import { getEtcEstimatedGas } from '../../api/etc/getEtcEstimatedGas';
import { getEtcTransactionByHash } from '../../api/etc/getEtcTransaction';
import { getTransactionReceipt } from '../../api/etc/getEtcTransactionReceipt';
import { sendEtcTransaction } from '../../api/etc/sendEtcTransaction';
import { toDict, toNothing, traverse } from '../../utils';
import { prefixWith } from '../../utils/strings';
import { topicOf } from '../models/Abi';
import type { ERC20Meta } from '../models/ERC20';
import { isValidERC20 } from '../models/ERC20';

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
  functionAbis = pipe(rfilter(item => item.type === 'function'), toDict(prop('name')))(erc20Abi);

  async checkIfERC20Token(contractAddress: string, caller: string): Promise<ERC20Check> {
    const getProperty = (name: string) =>
      this._getProperty(contractAddress, name)
        .then(Maybe.of)
        .catch(toNothing)
        .then(value => [name, value]);

    return traverse(getProperty)(['name', 'symbol', 'decimals', 'totalSupply'])
      .then(pairs => (fromPairs(pairs): ERC20Meta))
      .then(meta =>
        this.getAllowance(contractAddress, caller, caller)
          .then(Maybe.of)
          .catch(toNothing)
          .then(allowance => ({ ...meta, allowance }))
      )
      .then(meta =>
        this.getBalanceOf(contractAddress, caller)
          .then(Maybe.of)
          .catch(toNothing)
          .then(balanceOf => ({ ...meta, balanceOf }))
      )
      .then(meta => ({ ...meta, isERC20: isValidERC20(meta) }));
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
    return this._callContract(contractAddress, 'balanceOf', [accountAddress]).then(result => result[0]);
  }

  sendTokens(contractAddress: string, senderAddress: string, amount: number, receiverAddress: string): Promise<boolean> {
    const transferEventTopic = topicOf(erc20Abi.find(propEq('name', TRANSFER_EVENT_NAME)));
    const expectedTransferEvent = [transferEventTopic, padAddressTo64Bytes(senderAddress), padAddressTo64Bytes(receiverAddress)];

    return this._executeContractFunction(contractAddress, senderAddress, 'transfer', [receiverAddress, amount])
      .then(({ receipt }) => receipt.logs.some(propEq('topics', expectedTransferEvent)));
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

  _executeContractFunction(address: string, from: string, methodName: string, params: any[] = []): Promise<{ transaction: {}, receipt: {} }> {
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
        }))
      .then(this._pollForReceipt);
  }

  _pollForReceipt = (txHash: string): Promise<{ transaction: {}, receipt: {} }> => interval(TRANSACTION_POLL_INTERVAL)
    .pipe(
      concatMap(() => getEtcTransactionByHash({ ca, txHash })),
      filter(tx => !!tx.blockHash),
      concatMap(transaction => getTransactionReceipt({ ca, txHash }).then((receipt) => ({
        transaction,
        receipt
      }))),
      take(1)
    )
    .toPromise();
}
