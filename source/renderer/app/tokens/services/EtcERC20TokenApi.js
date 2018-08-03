// @flow
import { remote } from 'electron';
import abiCoder from 'web3-eth-abi';
import erc20Abi from 'human-standard-token-abi';
import { filter as sfilter, insert, pipe, prop, of, Nothing, toMaybe } from 'sanctuary';
import { interval } from 'rxjs';
import { pluck, filter, take, concatMap } from 'rxjs/operators';

import { ethCall } from '../../api/etc/ethCall';
import { getEtcEstimatedGas } from '../../api/etc/getEtcEstimatedGas';
import { sendEtcTransaction } from '../../api/etc/sendEtcTransaction';
import { getEtcTransactionByHash } from '../../api/etc/getEtcTransaction';

import { getTransactionReceipt } from '../../api/etc/getEtcTransactionReceipt';
import type { ERC20Meta } from '../models/ERC20';
import { isValidERC20 } from '../models/ERC20';

const ca = remote.getGlobal('ca');

const taggedLog = (tag: string) => (...vals) => console.log(tag, ...vals);
const taggedError = (tag: string) => (...vals) => console.error(tag, ...vals);

const groupBy = <T, K: string>(grouper: T => K) => (items: T[]): { [K]: T } =>
  items.reduce((map, item) => insert(grouper(item))(item)(map), {});

const traverse = fn => arr => Promise.all(arr.map(fn));

const fromPairs = <T>(arr) =>
  (arr.reduce((acc, [name, value]) => ({ ...acc, [name]: value }), {}): { [string]: T });


const toNothing = of(Function)(Nothing);

export type ERC20Check = ERC20Meta & {
  isERC20: boolean
};

export class EtcERC20TokenApi {
  functionAbis = pipe([sfilter(item => item.type === 'function'), groupBy(prop('name'))])(erc20Abi);

  async checkIfERC20Token(contractAddress: string, caller: string): Promise<ERC20Check> {
    const getProperty = (name: string) =>
      this._getProperty(contractAddress, name)
        .then(toMaybe)
        .catch(toNothing)
        .then(value => [name, value]);

    return traverse(getProperty)(['name', 'symbol', 'decimals', 'totalSupply'])
      .then(pairs => (fromPairs(pairs): ERC20Meta))
      .then(meta =>
        this.getAllowance(contractAddress, caller, caller)
          .then(toMaybe)
          .catch(toNothing)
          .then(allowance => ({ ...meta, allowance }))
      )
      .then(meta =>
        this.getBalanceOf(contractAddress, caller)
          .then(toMaybe)
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

  async deployContract(bytecode: string, from: string) {
    return sendEtcTransaction({
      type: 'deploy_contract',
      from,
      ca,
      data: bytecode,
      password: ''
    }).then(this.getContractAddressFromTransaction);
  }

  getContractAddressFromTransaction = async (txHash: string) =>
    interval(1000)
      .pipe(
        concatMap((val, index) => getEtcTransactionByHash({ ca, txHash })),
        filter(tx => !!tx.blockHash),
        concatMap((val, index) => getTransactionReceipt({ ca, txHash })),
        pluck('contractAddress'),
        take(1)
      )
      .toPromise();

  _buildCallData(methodName: string, params: any[]): string {
    return abiCoder.encodeFunctionCall(this.functionAbis[methodName], params);
  }

  async _getGasEstimation(data: string) {
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
}
