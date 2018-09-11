// @flow
import { action, observable } from 'mobx';
import { values } from 'ramda';

import environment from '../../../common/environment';
import { Logger } from '../../../common/logging';
import type { Api } from '../api';
import { EthRpc } from '../api/etc/EthRpc';
import {
  networkStatusFactory,
  peerCountConnectionChecker,
  validResponseConnectionChecker,
} from '../api/NetworkStatus';
import { getEtcSyncProgress } from '../api/SyncProgress';
import type { TokenStores } from '../tokens';
import { setupTokenStores } from '../tokens';

import type { AdaStoresMap } from './ada';
import setupAdaStores from './ada';
import AppStore from './AppStore';
import type { EtcStoresMap } from './etc';
import setupEtcStores from './etc';
import NetworkStatusStore from './NetworkStatusStore';
import ProfileStore from './ProfileStore';
import SidebarStore from './SidebarStore';
import UiDialogsStore from './UiDialogsStore';
import UiNotificationsStore from './UiNotificationsStore';
import WalletBackupStore from './WalletBackupStore';
import WindowStore from './WindowStore';

export const storeClasses = {
  profile: ProfileStore,
  app: AppStore,
  sidebar: SidebarStore,
  walletBackup: WalletBackupStore,
  window: WindowStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
};

export type StoresMap = {
  profile: ProfileStore,
  app: AppStore,
  router: Object,
  sidebar: SidebarStore,
  walletBackup: WalletBackupStore,
  window: WindowStore,
  uiDialogs: UiDialogsStore,
  uiNotifications: UiNotificationsStore,
  networkStatus: NetworkStatusStore,
  ada: AdaStoresMap,
  etc: EtcStoresMap,
  tokens: TokenStores,
};

const stores = observable({});

const CHECK_INTERVAL = 2000;
const getConnectionStatus = (ethRpc: EthRpc) => environment.isDev()
    ? validResponseConnectionChecker(CHECK_INTERVAL, () => getEtcSyncProgress(ethRpc), Logger)
    : peerCountConnectionChecker(CHECK_INTERVAL, () => ethRpc.netPeerCount(), Logger);

const getNetworkStatus = (ethRpc: EthRpc) => networkStatusFactory(getConnectionStatus(ethRpc), () => getEtcSyncProgress(ethRpc));

// Set up and return the stores for this app -> also used to reset all stores to defaults
export default action(
  (api: Api, actions, router): StoresMap => {
    // Assign mobx-react-router only once
    if (stores.router == null) stores.router = router;
    // All other stores have our lifecycle
    Object.keys(storeClasses).forEach(name => {
      if (stores[name]) stores[name].teardown();
      // $FlowIssue
      stores[name] = new storeClasses[name](stores, api, actions);
      stores[name].initialize();
    });

    if (stores.networkStatus) {
      stores.networkStatus.teardown();
    }
    stores.networkStatus = new NetworkStatusStore(
      getNetworkStatus(api.ethRpc),
      actions.networkStatus.isSyncedAndReady,
    );
    stores.networkStatus.initialize();

    // Add currency specific stores
    if (environment.API === 'ada') {
      stores.ada = setupAdaStores(stores, api, actions);
    } else if (environment.API === 'etc') {
      stores.etc = setupEtcStores(stores, api, actions);
      values(stores.tokens).forEach(store => store.teardown());
      stores.tokens = setupTokenStores(stores.etc.wallets, api.ethRpc);
    }

    return stores;
  },
);
