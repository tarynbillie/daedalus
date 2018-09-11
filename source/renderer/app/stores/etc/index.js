// @flow
import { action, observable } from 'mobx';

import EtcTransactionsStore from './EtcTransactionsStore';
import EtcWalletSettingsStore from './EtcWalletSettingsStore';
import EtcWalletsStore from './EtcWalletsStore';

export const etcStoreClasses = {
  wallets: EtcWalletsStore,
  walletSettings: EtcWalletSettingsStore,
  transactions: EtcTransactionsStore,
};

export type EtcStoresMap = {
  wallets: EtcWalletsStore,
  walletSettings: EtcWalletSettingsStore,
  transactions: EtcTransactionsStore,
};

const etcStores = observable({});

// Set up and return the stores and reset all stores to defaults
export default action((stores, api, actions): EtcStoresMap => {
  const storeNames = Object.keys(etcStoreClasses);
  storeNames.forEach(name => { if (etcStores[name]) etcStores[name].teardown(); });
  storeNames.forEach(name => {
    // $FlowFixMe - not every store needs access to all stores, apis and actions
    etcStores[name] = new etcStoreClasses[name](stores, api, actions);
  });
  storeNames.forEach(name => { if (etcStores[name]) etcStores[name].initialize(); });

  return etcStores;
});
