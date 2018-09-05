// @flow strict
import Action from '../lib/Action';

type RestoreWalletPayload = { recoveryPhrase: string, walletName: string, walletPassword: ?string };

export default class WalletsActions {
  createWallet: Action<{ name: string, password: ?string }> = new Action();

  restoreWallet: Action<RestoreWalletPayload> = new Action();

  deleteWallet: Action<{ walletId: string }> = new Action();

  sendMoney: Action<{ receiver: string, amount: string, password: ?string }> = new Action();
}
