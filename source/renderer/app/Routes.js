// @flow
import * as React from 'react';
import type { ContextRouter, LocationShape } from 'react-router';
import { Redirect, Route } from 'react-router';

import environment from '../../common/environment';

import LanguageSelectionPage from './containers/profile/LanguageSelectionPage';
import TermsOfUsePage from './containers/profile/TermsOfUsePage';
import Root from './containers/Root';
import DisplaySettingsPage from './containers/settings/categories/DisplaySettingsPage';
import GeneralSettingsPage from './containers/settings/categories/GeneralSettingsPage';
import SupportSettingsPage from './containers/settings/categories/SupportSettingsPage';
import TermsOfUseSettingsPage from './containers/settings/categories/TermsOfUseSettingsPage';
import Settings from './containers/settings/Settings';
import AdaRedemptionPage from './containers/wallet/AdaRedemptionPage';
import PaperWalletCreateCertificatePage from './containers/wallet/PaperWalletCreateCertificatePage';
import WalletAddPage from './containers/wallet/WalletAddPage';
import { ROUTES } from './routes-config';
import resolver from './utils/imports';

const Wallet = resolver('containers/wallet/Wallet');
const WalletSummaryPage = resolver('containers/wallet/WalletSummaryPage');
const WalletSendPage = resolver('containers/wallet/WalletSendPage');
const WalletReceivePage = resolver('containers/wallet/WalletReceivePage');
const WalletTransactionsPage = resolver('containers/wallet/WalletTransactionsPage');
const WalletSettingsPage = resolver('containers/wallet/WalletSettingsPage');
const WalletTokensPage = resolver('tokens/pages/WalletTokensPage');

export type RouteDeclaration = {|
  component?: React$ComponentType<*>,
  render?: (router: ContextRouter) => React$Node,
  path?: string,
  exact?: boolean,
  strict?: boolean,
  location?: LocationShape,
  sensitive?: boolean,
  children?: RouteDeclaration[],
  redirectTo?: string,
|};

export const renderRoutes = (routes: RouteDeclaration[]): React.Node[] => routes.map(renderRoute);

export const renderRoute = (route: RouteDeclaration): React.Node => {
  const commonProps = {
    key: route.path,
    path: route.path,
    exact: route.exact,
  };
  if (route.children && route.component) {
    const comp = route.component;
    const children = route.children;
    return (
      <Route
        {...commonProps}
        component={props => <comp {...props}>{renderRoutes(children)}</comp>}
      />
    );
  } else if (route.redirectTo) {
    const redirectTo = route.redirectTo;
    return (
      <Route
        {...commonProps}
        render={() => <Redirect to={redirectTo} />}
      />
    );
  } else {
    return <Route {...commonProps} component={route.component} />;
  }
};

export const rootRoute: RouteDeclaration = {
  path: ROUTES.ROOT,
  component: Root,
  children: [
    { path: '/', redirectTo: ROUTES.WALLETS.ROOT },
    { path: ROUTES.PROFILE.LANGUAGE_SELECTION, component: (LanguageSelectionPage: any) },
    { path: ROUTES.PROFILE.TERMS_OF_USE, component: (TermsOfUsePage: any) },
    { path: ROUTES.ADA_REDEMPTION, component: (AdaRedemptionPage: any) },
    { path: ROUTES.WALLETS.ADD, component: (WalletAddPage: any) },
    {
      path: ROUTES.WALLETS.ROOT,
      component: Wallet,
      children: [
        { path: ROUTES.WALLETS.SUMMARY, component: WalletSummaryPage },
        { path: ROUTES.WALLETS.TRANSACTIONS, component: WalletTransactionsPage },
        { path: ROUTES.WALLETS.SEND, component: WalletSendPage },
        { path: ROUTES.WALLETS.RECEIVE, component: WalletReceivePage },
        { path: ROUTES.WALLETS.SETTINGS, component: WalletSettingsPage },
        environment.isEtcApi()
          && environment.ENABLE_TOKENS_UI && { path: ROUTES.WALLETS.TOKENS, component: WalletTokensPage },
      ],
    },
    {
      path: '/settings',
      component: Settings,
      children: [
        { path: '/settings', redirectTo: '/settings/general' },
        { path: '/settings/general', component: (GeneralSettingsPage: any) },
        { path: '/settings/terms-of-use', component: (TermsOfUseSettingsPage: any) },
        { path: '/settings/support', component: (SupportSettingsPage: any) },
        { path: '/settings/display', component: (DisplaySettingsPage: any) },
      ],
    },
    { path: ROUTES.PAPER_WALLET_CREATE_CERTIFICATE, component: (PaperWalletCreateCertificatePage: any) },
  ],
};
