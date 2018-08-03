import { store, walletTokensKey } from '../api/etc/etcLocalStorage';
import WalletsStore from '../stores/WalletStore';
import { EtcERC20TokenApi } from './services/EtcERC20TokenApi';
import { TokenRepository } from './services/TokenRepository';
import { Erc20CheckerStore } from './stores/Erc20CheckerStore';
import { TokenStore } from './stores/TokenStore';

export interface TokenStores{
  erc20CheckerStore: Erc20CheckerStore;
  tokenStore: TokenStore;
}

export function setupTokenStores(walletsStore: WalletsStore): TokenStores {
  const erc20TokenApi = new EtcERC20TokenApi();
  const tokenRepository = new TokenRepository(store, walletTokensKey);
  const tokenStore = new TokenStore(tokenRepository, erc20TokenApi, walletsStore);
  const erc20CheckerStore = new Erc20CheckerStore(erc20TokenApi, walletsStore);

  tokenStore.initialize();

  return { tokenStore, erc20CheckerStore };
}
