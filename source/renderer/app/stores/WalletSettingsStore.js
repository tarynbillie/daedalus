// @flow
import { action, observable } from 'mobx';

import globalMessages from '../i18n/global-messages';
import { assuranceModeOptions } from '../types/transactionAssuranceTypes';

import Store from './lib/Store';

export default class WalletSettingsStore extends Store {

  WALLET_ASSURANCE_LEVEL_OPTIONS = [
    { value: assuranceModeOptions.NORMAL, label: globalMessages.assuranceLevelNormal },
    { value: assuranceModeOptions.STRICT, label: globalMessages.assuranceLevelStrict },
  ];

  @observable walletFieldBeingEdited = null;
  @observable lastUpdatedWalletField = null;

  @action startEditingWalletField = ({ field }: { field: string }) => {
    this.walletFieldBeingEdited = field;
  };

  @action stopEditingWalletField = () => {
    if (this.walletFieldBeingEdited) {
      this.lastUpdatedWalletField = this.walletFieldBeingEdited;
    }
    this.walletFieldBeingEdited = null;
  };

  @action cancelEditingWalletField = () => {
    this.lastUpdatedWalletField = null;
    this.walletFieldBeingEdited = null;
  };

}
