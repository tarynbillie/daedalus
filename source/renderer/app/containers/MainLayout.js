// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Sidebar from '../components/sidebar/Sidebar';
import TopBarContainer from './TopBarContainer';
import SidebarLayout from '../components/layout/SidebarLayout';
import NodeUpdatePage from './notifications/NodeUpdatePage';
import PaperWalletCreateCertificatePage from './wallet/PaperWalletCreateCertificatePage';
import type { InjectedContainerProps } from '../types/injectedPropsType';
import { ROUTES } from '../routes-config';
import { sidebarConfig } from '../config/sidebarConfig';

@inject('stores', 'actions')
@observer
export default class MainLayout extends Component<InjectedContainerProps> {
  static defaultProps = {
    actions: null,
    stores: null,
    children: null,
    onClose: () => {},
  };

  render() {
    const { actions, stores } = this.props;
    const { nodeUpdate, sidebar, wallets, profile, staking } = stores;
    const { isUpdateAvailable, isUpdatePostponed } = nodeUpdate;
    const activeWallet = wallets.active;
    const activeWalletId = activeWallet ? activeWallet.id : null;
    const { currentTheme } = profile;

    const sidebarMenus =
      sidebar.wallets.length > 0
        ? {
            wallets: {
              items: sidebar.wallets,
              activeWalletId,
              actions: {
                onWalletItemClick: (walletId: string) => {
                  actions.sidebar.walletSelected.trigger({ walletId });
                },
              },
            },
          }
        : null;

    // TODO - remove after testing
    const categories = staking.activeDelegationCenterMenuItem === 0 ? sidebarConfig.CATEGORIES_WITH_DELEGATION_COUNTDOWN : sidebarConfig.CATEGORIES_WITHOUT_DELEGATION_COUNTDOWN

    const sidebarComponent = (
      <Sidebar
        menus={sidebarMenus}
        isShowingSubMenus={sidebar.isShowingSubMenus}
        categories={categories}
        activeSidebarCategory={sidebar.activeSidebarCategory}
        onCategoryClicked={category => {
          actions.sidebar.activateSidebarCategory.trigger({ category });
        }}
        isSynced
        openDialogAction={actions.dialogs.open.trigger}
        onAddWallet={() =>
          actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
        }
        onSubmitSupportRequest={() =>
          actions.router.goToRoute.trigger({ route: ROUTES.SETTINGS.SUPPORT })
        }
        pathname={this.props.stores.router.location.pathname}
        currentTheme={currentTheme}
      />
    );

    const addNodeUpdateNotification =
      isUpdateAvailable && !isUpdatePostponed ? <NodeUpdatePage /> : null;

    return (
      <SidebarLayout
        sidebar={sidebarComponent}
        topbar={<TopBarContainer />}
        notification={addNodeUpdateNotification}
        contentDialogs={[
          <PaperWalletCreateCertificatePage
            key="PaperWalletCreateCertificatePage"
            certificateStep={this.props.stores.wallets.certificateStep}
          />,
        ]}
      >
        {this.props.children}
      </SidebarLayout>
    );
  }
}
