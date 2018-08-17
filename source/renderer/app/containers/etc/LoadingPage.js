// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { shell } from 'electron';
import CenteredLayout from '../../components/layout/CenteredLayout';
import BugReportDialog from '../../components/profile/bug-report/BugReportDialog';
import WalletSupportRequestPage from '../../containers/wallet/WalletSupportRequestPage';
import Loading from '../../components/loading/Loading';
import etcLogo from '../../assets/images/etc-logo.inline.svg';
import mantisLogo from '../../assets/images/mantis-logo.inline.svg';
import { messages } from '../LoadingPage';
import type { InjectedProps } from '../../types/injectedPropsType';

@inject('stores', 'actions')
@observer
export default class LoadingPage extends Component<InjectedProps> {
  render() {
    const { stores } = this.props;
    const {
      isConnecting,
      isSyncing,
      isSynced,
      syncPercentage,
      hasSyncingStarted,
    } = stores.networkStatus.networkStatus;
    const { hasLoadedCurrentLocale, hasLoadedCurrentTheme } = stores.profile;
    return (
      <CenteredLayout>
        <Loading
          currencyIcon={etcLogo}
          apiIcon={mantisLogo}
          isSyncing={isSyncing}
          isSynced={isSynced}
          isConnecting={isConnecting}
          syncPercentage={syncPercentage}
          loadingDataForNextScreenMessage={messages.loadingWalletData}
          hasBeenConnected={stores.networkStatus.hasBeenConnected}
          hasBlockSyncingStarted={hasSyncingStarted}
          hasLoadedCurrentLocale={hasLoadedCurrentLocale}
          hasLoadedCurrentTheme={hasLoadedCurrentTheme}
          handleReportIssue={this.handleReportIssue}
          onProblemSolutionClick={this.handleProblemSolutionClick}
        />
        <WalletSupportRequestPage />
      </CenteredLayout>
    );
  }

  handleReportIssue = () => {
    this.props.actions.dialogs.open.trigger({
      dialog: BugReportDialog,
    });
  };

  handleProblemSolutionClick = (link: string) => {
    shell.openExternal(`https://${link}`);
  };
}
