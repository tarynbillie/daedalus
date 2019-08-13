// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { map, find, get } from 'lodash';
import DelegationCenter from '../../components/staking/delegation-center/DelegationCenter';
import DelegationSetupWizardDialogContainer from './dialogs/DelegationSetupWizardDialogContainer';
import DelegationSetupWizardDialog from '../../components/staking/delegation-setup-wizard/DelegationSetupWizardDialog';
import DelegationCenterNoWallets from '../../components/staking/delegation-center/DelegationCenterNoWallets';
import { ROUTES } from '../../routes-config';
import type { InjectedProps } from '../../types/injectedPropsType';

type Props = InjectedProps;

@inject('stores', 'actions')
@observer
export default class DelegationCenterPage extends Component<Props> {
  static defaultProps = { stores: null };

  handleDelegate = (walletId: string) => {
    const { actions } = this.props;
    const { updateDataForActiveDialog } = actions.dialogs;

    actions.dialogs.open.trigger({ dialog: DelegationSetupWizardDialog });
    updateDataForActiveDialog.trigger({
      data: { walletId },
    });
  };

  handleGoToCreateWalletClick = () => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  };

  handleSelectDelegatedWalletActionOption = (option: string, walletId: string) => {
    const { actions } = this.props;
    const { staking } = this.props.stores;

    if (option === 'changeDelegation') {
      const { updateDataForActiveDialog } = actions.dialogs;
      const delegatedWallet = find(staking.delegatedFunds, wallet => wallet.walletId === walletId);
      const selectedPoolId = get(delegatedWallet, ['selectedPool', 'id'], null);

      actions.dialogs.open.trigger({ dialog: DelegationSetupWizardDialog });
      updateDataForActiveDialog.trigger({
        data: { walletId, poolId: selectedPoolId },
      });
    }

    if (option === 'removeDelegation') {
      staking.removeDelegatedWallet(walletId);
    }
  }

  render() {
    const { uiDialogs, staking, wallets } = this.props.stores;

    if (!wallets.all.length) {
      return (
        <DelegationCenterNoWallets
          onGoToCreateWalletClick={this.handleGoToCreateWalletClick}
        />
      );
    }

    return (
      <div>
        <DelegationCenter
          adaValue={staking.adaValue}
          percentage={staking.percentage}
          wallets={wallets.all}
          delegatedWallets={staking.delegatedFunds}
          onDelegate={this.handleDelegate}
          onSelectDelegatedWalletActionOption={this.handleSelectDelegatedWalletActionOption}
        />
        {uiDialogs.isOpen(DelegationSetupWizardDialog) ? (
          <DelegationSetupWizardDialogContainer />
        ) : null}
      </div>
    );
  }
}
