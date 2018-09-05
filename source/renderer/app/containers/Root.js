// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import resolver from '../utils/imports';
import environment from '../../../common/environment';
import type { InjectedContainerProps } from '../types/injectedPropsType';

import WalletAddPage from './wallet/WalletAddPage';

const LoadingPage = resolver('containers/LoadingPage');

type Props = InjectedContainerProps;

@inject(['stores']) @observer
export default class Root extends Component<Props> {

  render() {
    const { stores, children } = this.props;
    const { networkStatus, profile, ada } = stores;
    const wallets = stores[environment.API].wallets;
    const isAdaRedemptionPage = environment.isAdaApi() && ada.adaRedemption.isAdaRedemptionPage;
    const isPageThatDoesntNeedWallets = (
      profile.isSettingsPage || isAdaRedemptionPage
    );
    // Just render any page that doesn't require wallets to be loaded
    if (networkStatus.isConnected && isPageThatDoesntNeedWallets) {
      return React.Children.only(children);
    }

    if (!networkStatus.isSynced || !wallets.hasLoadedWallets) {
      return <LoadingPage />;
    } else if (!wallets.hasAnyWallets) {
      return <WalletAddPage />;
    }
    return React.Children.only(children);
  }
}
