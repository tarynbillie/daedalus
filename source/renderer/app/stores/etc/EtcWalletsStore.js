// @flow
import { BigNumber } from 'bignumber.js';
import { observable } from 'mobx';
import { isNil } from 'ramda';

import type {
  CreateTransactionResponse,
  CreateWalletResponse,
  DeleteWalletResponse,
  GetWalletRecoveryPhraseResponse,
  GetWalletsResponse,
  RestoreWalletResponse,
} from '../../api/common';
import type { CreateTransactionParams, GetEstimatedGasPriceResponse } from '../../api/etc';
import { SEND_ETHER } from '../../api/etc/EtcTransaction';
import { ETC_DEFAULT_GAS_PRICE, HARDCODED_ETC_TX_FEE, WEI_PER_ETC } from '../../config/numbersConfig';
import Request from '../lib/LocalizedRequest';
import WalletStore from '../WalletStore';

export default class EtcWalletsStore extends WalletStore {
  // REQUESTS
  @observable
  walletsRequest: Request<GetWalletsResponse> = new Request(this.api.etc.getWallets);
  @observable
  createWalletRequest: Request<CreateWalletResponse> = new Request(this.api.etc.createWallet);
  @observable
  deleteWalletRequest: Request<DeleteWalletResponse> = new Request(this.api.etc.deleteWallet);
  @observable
  sendMoneyRequest: Request<CreateTransactionResponse> = new Request(this.api.etc.createTransaction);
  @observable
  getEstimatedGasPriceRequest: Request<GetEstimatedGasPriceResponse> = new Request(
    this.api.etc.getEstimatedGasPriceResponse,
  );
  @observable
  getWalletRecoveryPhraseRequest: Request<GetWalletRecoveryPhraseResponse> = new Request(
    this.api.etc.getWalletRecoveryPhrase,
  );
  @observable
  restoreRequest: Request<RestoreWalletResponse> = new Request(this.api.etc.restoreWallet);

  setup() {
    super.setup();
    const { walletBackup, etc } = this.actions;
    const { wallets } = etc;
    wallets.createWallet.listen(this.create);
    wallets.deleteWallet.listen(this.delete);
    wallets.sendMoney.listen(this._sendMoney);
    wallets.restoreWallet.listen(this.restore);
    walletBackup.finishWalletBackup.listen(this.finishCreation);
  }

  _sendMoney = async (transactionDetails: { receiver: string, amount: string, password: ?string }) => {
    const wallet = this.active;
    if (!wallet) throw new Error('Active wallet required before sending.');
    const { receiver, amount, password } = transactionDetails;
    await this.sendMoneyRequest.execute(
      ({
        tx: {
          type: SEND_ETHER,
          from: wallet.id,
          to: receiver,
          value: new BigNumber(amount),
          gasPrice: ETC_DEFAULT_GAS_PRICE,
        },
        password: isNil(password) ? '' : password,
      }: CreateTransactionParams),
    );
    this.refreshWalletsData();
    this.actions.dialogs.closeActiveDialog.trigger();
    this.sendMoneyRequest.reset();
    this.goToWalletRoute(wallet.id);
  };

  calculateTransactionFee = async (transactionDetails: { sender: string, receiver: string, amount: string }) => {
    const { sender, receiver, amount } = transactionDetails;
    return await this.getEstimatedGasPriceRequest.execute({
      from: sender,
      to: receiver,
      value: new BigNumber(amount),
      gasPrice: ETC_DEFAULT_GAS_PRICE,
    });
  };

  isValidMnemonic = (mnemonic: string) => this.api.etc.isValidMnemonic(mnemonic);

  isValidAddress = (address: string) => this.api.etc.isValidAddress(address);

  isValidAmount = (amount: string) => {
    const wallet = this.active;
    if (!wallet) throw new Error('Active wallet required before sending.');
    const amountInETC = new BigNumber(amount).dividedBy(WEI_PER_ETC);
    const transactionFees = new BigNumber(HARDCODED_ETC_TX_FEE);
    const isGreaterThanZero = amountInETC.greaterThan(0);
    const isLessOrEqualToWalletAmount = amountInETC.add(transactionFees).lessThanOrEqualTo(wallet.amount);
    return isGreaterThanZero && isLessOrEqualToWalletAmount;
  };
}
