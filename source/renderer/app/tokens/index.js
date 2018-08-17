// @flow strict
import { store, walletTokensKey } from '../api/etc/etcLocalStorage';
import WalletsStore from '../stores/WalletStore';
import { EtcERC20TokenApi } from './services/EtcERC20TokenApi';
import { TokenRepository } from './services/TokenRepository';
import { TokenStore } from './stores/TokenStore';

export interface TokenStores{
  tokenStore: TokenStore;
}

export function setupTokenStores(walletsStore: WalletsStore): TokenStores {
  const erc20TokenApi = new EtcERC20TokenApi();
  const tokenRepository = new TokenRepository(store, walletTokensKey);
  const tokenStore = new TokenStore(tokenRepository, erc20TokenApi, walletsStore);

  tokenStore.initialize();

  return { tokenStore };
}
