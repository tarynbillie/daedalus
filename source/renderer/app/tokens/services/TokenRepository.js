// @flow
import Store from 'electron-store';

import type { WalletTokensKeyBuilder } from '../../api/etc/etcLocalStorage';
import { addToken } from '../models/ERC20';
import type { ERC20Token, TokensMap } from '../models/ERC20';

export class TokenRepository {
  _store: Store;
  _keyBuilder: WalletTokensKeyBuilder;

  constructor(store: Store, keyBuilder: WalletTokensKeyBuilder) {
    this._store = store;
    this._keyBuilder = keyBuilder;
  }

  addToken(walletId: string, token: ERC20Token): Promise<TokensMap> {
    return this.updateWalletTokens(addToken(token), walletId);
  }

  getWalletTokens(walletId: string): Promise<TokensMap> {
    return new Promise(resolve => resolve(this._store.get(this._keyBuilder(walletId)) || {}));
  }

  updateWalletTokens(
    updater: (TokensMap => TokensMap | Promise<TokensMap>),
    walletId: string
  ): Promise<TokensMap> {
    return this.getWalletTokens(walletId)
      .then(updater)
      .then(this._setWalletTokens(walletId));
  }

  _setWalletTokens = (walletId: string) => (tokens: TokensMap): Promise<TokensMap> =>
    new Promise(resolve => {
      const walletKey = this._keyBuilder(walletId);
      this._store.set(walletKey, tokens);
      resolve(tokens);
    });
}
