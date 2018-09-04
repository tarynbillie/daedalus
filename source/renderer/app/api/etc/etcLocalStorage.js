// @flow strict
import Store from 'electron-store';

import environment from '../../../../common/environment';
import type { AssuranceModeOption } from '../../types/transactionAssuranceTypes';
import { tryAsync } from '../../utils/promise';

export const store = new Store();

const networkForLocalStorage = String(environment.NETWORK);
const storageKeys = {
  WALLETS: networkForLocalStorage + '-ETC-WALLETS',
  TOKENS: networkForLocalStorage + '-ETC-TOKENS',
};

/**
 * This api layer provides access to the electron local storage
 * for account/wallet properties that are not synced with ETC backend.
 */

export type EtcWalletData = {
  id: string,
  name: string,
  assurance: AssuranceModeOption,
  hasPassword: boolean,
  passwordUpdateDate: ?Date,
};

type UpdatedWalletData = {
  id: string,
  name?: string,
  assurance?: AssuranceModeOption,
  hasPassword?: boolean,
  passwordUpdateDate?: ?Date,
};

const walletKey = (walletId: string) => `${storageKeys.WALLETS}.${walletId}`;

export const getEtcWalletData = (walletId: string): Promise<EtcWalletData> =>
  tryAsync(() => store.get(walletKey(walletId)));

export const setEtcWalletData = (walletData: EtcWalletData): Promise<void> =>
  tryAsync(() => store.set(walletKey(walletData.id), walletData));

export const updateEtcWalletData = (updatedWalletData: UpdatedWalletData): Promise<void> =>
  getEtcWalletData(updatedWalletData.id)
    .then(walletData => ({ ...walletData, ...updatedWalletData }))
    .then(setEtcWalletData);

export const unsetEtcWalletData = (walletId: string): Promise<void> =>
  tryAsync(() => store.delete(walletKey(walletId)));

export const unsetEtcWalletsData = (): Promise<void> => tryAsync(() => store.delete(storageKeys.WALLETS));

// Tokens

export const walletTokensKey = (walletId: string): string => storageKeys.TOKENS + '.' + walletId;
export type WalletTokensKeyBuilder = typeof walletTokensKey;
