// @flow
import { BigNumber } from 'bignumber.js';
import { isNil, tap } from 'ramda';
import { isAddress } from 'web3-utils/src/utils';

import { isValidMnemonic } from '../../../../common/decrypt';
import { Logger, stringifyData, stringifyError, withLogsAsync } from '../../../../common/logging';
import { ETC_DEFAULT_GAS_PRICE, WEI_PER_ETC } from '../../config/numbersConfig';
import Wallet from '../../domains/Wallet';
import WalletTransaction, { transactionStates, transactionTypes } from '../../domains/WalletTransaction';
import { generateMnemonic } from '../../utils/crypto';
import type {
  CreateTransactionResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  DeleteWalletRequest,
  DeleteWalletResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  GetWalletRecoveryPhraseResponse,
  GetWalletsResponse,
  RestoreWalletRequest,
  RestoreWalletResponse,
  SendBugReportResponse,
  UpdateWalletPasswordRequest,
  UpdateWalletPasswordResponse,
  UpdateWalletResponse,
} from '../common';
import { GenericApiError, IncorrectWalletPasswordError, WalletAlreadyRestoredError } from '../common';

import { getEtcWalletData, setEtcWalletData, unsetEtcWalletData, updateEtcWalletData } from './etcLocalStorage';
import type { EtcTransaction, EtcTransactionParams, EtcTransactions, SendEtcTransactionParams } from './EtcTransaction';
import { withGas } from './EtcTransaction';
import { EthRpc } from './EthRpc';
import { mnemonicToSeedHex, quantityToBigNumber, unixTimestampToDate } from './lib/utils';
import type { BugReportFormData } from './sendEtcBugReport';
import { sendEtcBugReport } from './sendEtcBugReport';
import type {
  EtcAccounts,
  EtcBlockNumber,
  EtcBlockResponse,
  EtcRecoveryPassphrase,
  EtcTxHash,
  EtcWalletBalance,
  EtcWalletId,
} from './types';

/**
 * The ETC api layer that handles all requests to the
 * mantis client which is used as backend for ETC blockchain.
 */

// ETC specific Request / Response params
export type ImportWalletResponse = Wallet;
export type UpdateWalletRequest = Wallet;

export type GetEstimatedGasPriceResponse = Promise<BigNumber>;
export type CreateTransactionParams = { tx: SendEtcTransactionParams, password: string };

export class EtcApi {
  _ethRpc: EthRpc;

  constructor(ethRpc: EthRpc) {
    this._ethRpc = ethRpc;
  }

  getWallets = (): Promise<GetWalletsResponse> => {
    const getWallet = (id: string): Promise<Wallet> => this.getAccountBalance(id).then(amount => getEtcWalletData(id)
          .then(walletData => new Wallet({ ...walletData, id, amount }))
          .catch(
            () => new Wallet({
                id,
                amount,
                name: 'Untitled Wallet (*)',
                assurance: 'CWANormal',
                hasPassword: true,
                passwordUpdateDate: new Date(),
              }),
          ),
      );

    Logger.debug('EtcApi::getWallets called');
    return this._ethRpc
      .personalListAccounts()
      .then(tap(accounts => Logger.debug('EtcApi::getWallets success: ' + stringifyData(accounts))))
      .then(accounts => Promise.all(accounts.map(getWallet)))
      .catch(error => {
        Logger.error('EtcApi::getWallets error: ' + stringifyError(error));
        throw new GenericApiError(error);
      });
  };

  @withLogsAsync('EtcApi::getAccountBalance')
  async getAccountBalance(walletId: string): Promise<EtcWalletBalance> {
    return this._ethRpc
      .ethGetBalance({ walletId, status: 'latest' })
      .then(response => response.dividedBy(WEI_PER_ETC))
      .catch(error => {
        throw new GenericApiError(error);
      });
  }

  getTransactions = async (request: GetTransactionsRequest): Promise<GetTransactionsResponse> => {
    Logger.debug('EtcApi::getTransactions called: ' + stringifyData(request));
    try {
      const walletId = request.walletId;
      const mostRecentBlockNumber: EtcBlockNumber = await this._ethRpc.ethBlockNumber();
      const response: EtcTransactions = await this._ethRpc.daedalusGetAccountTransactions({
        walletId,
        fromBlock: Math.max(mostRecentBlockNumber - 10000, 0),
        toBlock: mostRecentBlockNumber,
      });
      Logger.debug('EtcApi::getTransactions success: ' + stringifyData(response));
      const transactions = await Promise.all(response.transactions.map(this._createWalletTransactionFromServerData));
      return {
        transactions,
        total: transactions.length,
      };
    } catch (error) {
      Logger.debug('EtcApi::getTransactions error: ' + stringifyError(error));
      throw new GenericApiError(error);
    }
  };

  async importWallet(request: { name: string, privateKey: string, password: ?string }): Promise<ImportWalletResponse> {
    Logger.debug('EtcApi::importWallet called');
    const { name, privateKey, password } = request;
    try {
      const response: EtcWalletId = await this._ethRpc.personalImportRawKey({ privateKey, password });
      Logger.debug('EtcApi::importWallet success: ' + stringifyData(response));
      const id = response;
      const amount = quantityToBigNumber('0');
      const assurance = 'CWANormal';
      const hasPassword = password !== null;
      const passwordUpdateDate = hasPassword ? new Date() : null;
      await setEtcWalletData({
        id,
        name,
        assurance,
        hasPassword,
        passwordUpdateDate,
      });
      return new Wallet({ id, name, amount, assurance, hasPassword, passwordUpdateDate });
    } catch (error) {
      Logger.error('EtcApi::importWallet error: ' + stringifyError(error));
      throw error; // Error is handled in parent method (e.g. createWallet/restoreWallet)
    }
  }

  createWallet = async (request: CreateWalletRequest): Promise<CreateWalletResponse> => {
    Logger.debug('EtcApi::createWallet called');
    const { name, mnemonic, password } = request;
    const privateKey = mnemonicToSeedHex(mnemonic);
    try {
      const response: ImportWalletResponse = await this.importWallet({ name, privateKey, password });
      Logger.debug('EtcApi::createWallet success: ' + stringifyData(response));
      return response;
    } catch (error) {
      Logger.error('EtcApi::createWallet error: ' + stringifyError(error));
      throw new GenericApiError(error);
    }
  };

  getWalletRecoveryPhrase(): Promise<GetWalletRecoveryPhraseResponse> {
    Logger.debug('EtcApi::getWalletRecoveryPhrase called');
    try {
      const response: Promise<EtcRecoveryPassphrase> = Promise.resolve(generateMnemonic().split(' '));
      Logger.debug('EtcApi::getWalletRecoveryPhrase success');
      return response;
    } catch (error) {
      Logger.error('EtcApi::getWalletRecoveryPhrase error: ' + stringifyError(error));
      throw new GenericApiError(error);
    }
  }

  createTransaction = async ({ tx, password }: CreateTransactionParams): Promise<CreateTransactionResponse> => {
    Logger.debug('EtcApi::createTransaction called');
    try {
      const senderAccount = tx.from;
      const gas = await this._ethRpc.ethEstimateGas({ tx });
      const txHash: EtcTxHash = await this._ethRpc.personalSendTransaction({
        tx: withGas(gas)(tx),
        password,
      });
      Logger.debug('EtcApi::createTransaction success: ' + stringifyData(txHash));
      return this._createTransaction(senderAccount, txHash);
    } catch (error) {
      Logger.debug('EtcApi::createTransaction error: ' + stringifyError(error));
      if (error.message.includes('Could not decrypt key with given passphrase')) {
        throw new IncorrectWalletPasswordError();
      }
      throw new GenericApiError(error);
    }
  };

  async updateWallet(request: UpdateWalletRequest): Promise<UpdateWalletResponse> {
    Logger.debug('EtcApi::updateWallet called: ' + stringifyData(request));
    const { id, name, amount, assurance, hasPassword, passwordUpdateDate } = request;
    try {
      await setEtcWalletData({
        id,
        name,
        assurance,
        hasPassword,
        passwordUpdateDate,
      });
      Logger.debug('EtcApi::updateWallet success: ' + stringifyData(request));
      return new Wallet({ id, name, amount, assurance, hasPassword, passwordUpdateDate });
    } catch (error) {
      Logger.error('EtcApi::updateWallet error: ' + stringifyError(error));
      throw new GenericApiError(error);
    }
  }

  updateWalletPassword = async (request: UpdateWalletPasswordRequest): Promise<UpdateWalletPasswordResponse> => {
    Logger.debug('EtcApi::updateWalletPassword called');
    const { walletId, oldPassword, newPassword } = request;
    try {
      await this._ethRpc.daedalusChangePassphrase({ walletId, oldPassword, newPassword });
      Logger.debug('EtcApi::updateWalletPassword success');
      const hasPassword = !isNil(newPassword);
      const passwordUpdateDate = new Date();
      await updateEtcWalletData({ id: walletId, hasPassword, passwordUpdateDate });
      return true;
    } catch (error) {
      Logger.debug('EtcApi::updateWalletPassword error: ' + stringifyError(error));
      if (error.message.includes('Could not decrypt key with given passphrase')) {
        throw new IncorrectWalletPasswordError();
      }
      throw new GenericApiError(error);
    }
  };

  deleteWallet = async (request: DeleteWalletRequest): Promise<DeleteWalletResponse> => {
    Logger.debug('EtcApi::deleteWallet called: ' + stringifyData(request));
    const { walletId } = request;
    try {
      await this._ethRpc.daedalusDeleteWallet({ walletAddress: walletId });
      Logger.debug('EtcApi::deleteWallet success: ' + stringifyData(request));
      await unsetEtcWalletData(walletId); // remove wallet data from local storage
      return true;
    } catch (error) {
      Logger.error('EtcApi::deleteWallet error: ' + stringifyError(error));
      throw new GenericApiError(error);
    }
  };

  restoreWallet = async (request: RestoreWalletRequest): Promise<RestoreWalletResponse> => {
    Logger.debug('EtcApi::restoreWallet called');
    const { recoveryPhrase: mnemonic, walletName: name, walletPassword: password } = request;
    const privateKey = mnemonicToSeedHex(mnemonic);
    try {
      const wallet: ImportWalletResponse = await this.importWallet({ name, privateKey, password });
      Logger.debug('EtcApi::restoreWallet success: ' + stringifyData(wallet));
      return wallet;
    } catch (error) {
      Logger.debug('EtcApi::restoreWallet error: ' + stringifyError(error));
      if (error.message.includes('account already exists')) {
        throw new WalletAlreadyRestoredError();
      }
      throw new GenericApiError(error);
    }
  };

  isValidMnemonic = (mnemonic: string) => isValidMnemonic(mnemonic, 12);

  isValidAddress = (address: string) => Promise.resolve(isAddress(address));

  getEstimatedGasPriceResponse = async (request: $Shape<EtcTransactionParams>): GetEstimatedGasPriceResponse => {
    Logger.debug('EtcApi::getEstimatedGasPriceResponse called');
    try {
      const estimatedGas = await this._ethRpc.ethEstimateGas({ tx: request });
      Logger.debug('EtcApi::getEstimatedGasPriceResponse success: ' + stringifyData(estimatedGas));
      return estimatedGas.times(request.gasPrice || ETC_DEFAULT_GAS_PRICE).dividedBy(WEI_PER_ETC);
    } catch (error) {
      Logger.error('EtcApi::getEstimatedGasPriceResponse error: ' + stringifyError(error));
      throw new GenericApiError(error);
    }
  };

  async sendBugReport(request: BugReportFormData): Promise<SendBugReportResponse> {
    Logger.debug('EtcApi::sendBugReport called: ' + stringifyData(request));
    try {
      await sendEtcBugReport({ requestFormData: request, application: 'mantis-node' });
      Logger.debug('EtcApi::sendBugReport success');
      return true;
    } catch (error) {
      Logger.error('EtcApi::sendBugReport error: ' + stringifyError(error));
      throw new GenericApiError(error);
    }
  }

  testReset = async (): Promise<boolean> => {
    Logger.debug('EtcApi::testReset called');
    try {
      const accounts: EtcAccounts = await this._ethRpc.personalListAccounts();
      await Promise.all(accounts.map(async id => this.deleteWallet({ walletId: id })));
      Logger.debug('EtcApi::testReset success');
      return true;
    } catch (error) {
      Logger.error('EtcApi::testReset error: ' + stringifyError(error));
      throw new GenericApiError(error);
    }
  };

  _createWalletTransactionFromServerData = async (txData: EtcTransaction): Promise<WalletTransaction> => {
    const { hash, blockHash, value, from, to, isOutgoing } = txData;
    const txBlock: EtcBlockResponse = blockHash ? await this._ethRpc.ethGetBlockByHash({ blockHash }) : null;
    const blockDate = txBlock ? unixTimestampToDate(txBlock.timestamp) : new Date();

    return new WalletTransaction({
      id: hash,
      type: isOutgoing ? transactionTypes.EXPEND : transactionTypes.INCOME,
      title: '',
      description: '',
      amount: quantityToBigNumber(value).dividedBy(WEI_PER_ETC),
      date: blockDate,
      numberOfConfirmations: 0,
      addresses: {
        from: [from],
        to: [to],
      },
      state: blockHash ? transactionStates.OK : transactionStates.PENDING,
    });
  };

  _createTransaction = async (senderAccount: EtcWalletId, txHash: EtcTxHash) => {
    const txData: EtcTransaction = await this._ethRpc.ethGetTransactionByHash({ txHash });
    txData.isOutgoing = senderAccount === txData.from;
    return this._createWalletTransactionFromServerData(txData);
  };
}
