// @flow strict
import Action from '../lib/Action';

type UpdateWalletPasswordPayload = {
  walletId: string,
  oldPassword: ?string,
  newPassword: ?string,
}

export default class WalletSettingsActions {
  cancelEditingWalletField: Action<void> = new Action();

  startEditingWalletField: Action<{ field: string }> = new Action();

  stopEditingWalletField: Action<void> = new Action();

  updateWalletField: Action<{ field: string, value: string }> = new Action();

  updateWalletPassword: Action<UpdateWalletPasswordPayload> = new Action();
}
