// @flow
import { action, observable } from 'mobx';
import { values } from 'ramda';
import environment from '../../../common/environment';
import type { TokenStores } from '../tokens';
import { setupTokenStores } from '../tokens';
import type { AdaStoresMap } from './ada';
import setupAdaStores from './ada';
import AppStore from './AppStore';
import type { EtcStoresMap } from './etc';
import setupEtcStores from './etc';
import type { StoreLifecycle } from './lib/Store';
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
  networkStatus: NetworkStatusStore,
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

// Constant that does never change during lifetime
const stores = observable({
  profile: null,
  router: null,
  app: null,
  sidebar: null,
  walletBackup: null,
  window: null,
  uiDialogs: null,
  uiNotifications: null,
  networkStatus: null,
  ada: null,
  etc: null,
  tokens: null
});

// Set up and return the stores for this app -> also used to reset all stores to defaults
export default action((api, actions, router): StoresMap => {
  // Assign mobx-react-router only once
  if (stores.router == null) stores.router = router;
  // All other stores have our lifecycle
  const storeNames = Object.keys(storeClasses);
  storeNames.forEach(name => { if (stores[name]) stores[name].teardown(); });
  storeNames.forEach(name => { stores[name] = new storeClasses[name](stores, api, actions); });
  storeNames.forEach(name => { if (stores[name]) stores[name].initialize(); });

  // Add currency specific stores
  if (environment.API === 'ada') {
    stores.ada = setupAdaStores(stores, api, actions);
  } else if (environment.API === 'etc') {
    stores.etc = setupEtcStores(stores, api, actions);
    values(stores.tokens).forEach(store => store.teardown());
    stores.tokens = setupTokenStores(stores.etc.wallets);
  }

  return stores;
});
