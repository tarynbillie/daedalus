// @flow strict
import { action, observable } from 'mobx';
import { assoc, complement, isNil, values } from 'ramda';
import { interval, merge, Subscription } from 'rxjs';
import { concatMap, distinctUntilChanged, filter, pluck } from 'rxjs/operators';

import { RxStore } from '../../stores/lib/RxStore';
import WalletsStore from '../../stores/WalletStore';
import { asObservable } from '../../utils/mobx';
import type { ERC20Token, TokensMap } from '../models/ERC20';
import type { ERC20Check } from '../services/EtcERC20TokenApi';
import { EtcERC20TokenApi } from '../services/EtcERC20TokenApi';
import { TokenRepository } from '../services/TokenRepository';

type TokenWithBalance = { token: ERC20Token, balance: number };

const TOKEN_BALANCE_REFRESH_INTERVAL = 10000;

export class TokenStore extends RxStore {
  @observable.ref
  tokens: ERC20Token[] = [];
  @observable.ref
  tokenBalances: { [string]: number } = {};

  _tokenRepository: TokenRepository;
  _erc20TokenApi: EtcERC20TokenApi;
  _walletStore: WalletsStore;

  _currentWalletId: string;

  constructor(
    tokenRepository: TokenRepository,
    erc20TokenApi: EtcERC20TokenApi,
    walletStore: WalletsStore,
  ) {
    super();
    this._tokenRepository = tokenRepository;
    this._erc20TokenApi = erc20TokenApi;
    this._walletStore = walletStore;
  }

  setup(): Subscription[] {
    const updateTokensSubscription = asObservable(() => this._walletStore.active)
      .pipe(
        pluck('newValue'),
        filter(complement(isNil)),
        pluck('id'),
        distinctUntilChanged(),
      )
      .subscribe(walletId => {
        this._currentWalletId = walletId;
        this._setTokens({});
        this._setBalances({});
        this._updateTokens();
      });

    const updateBalancesSubscription = merge(
      interval(TOKEN_BALANCE_REFRESH_INTERVAL),
      asObservable(() => this.tokens),
    )
      .pipe(
        concatMap(() => this.tokens),
        concatMap(token => this._fetchBalance(token)),
      )
      .subscribe(this._setBalance, console.error);

    return [updateTokensSubscription, updateBalancesSubscription];
  }

  addToken(token: ERC20Token): Promise<void> {
    return this._tokenRepository
      .addToken(this._currentWalletId, token)
      .then(tokens => this._setTokens(tokens));
  }

  checkAddress(address: string): Promise<ERC20Check> {
    return this._erc20TokenApi.checkIfERC20Token(address, this._currentWalletId);
  }

  getBalance(token: ERC20Token): number {
    return this.tokenBalances[token.address.toLowerCase()] || 0;
  }

  stopWatching(token: ERC20Token): Promise<void> {
    return this._tokenRepository
      .removeToken(this._currentWalletId, token)
      .then(tokens => this._setTokens(tokens));
  }

  sendTokens(token: ERC20Token, amount: number, receiver: string): Promise<boolean> {
    return this._erc20TokenApi.sendTokens(token.address, this._currentWalletId, amount, receiver);
  }

  _updateTokens = (): Promise<void> =>
    this._tokenRepository
      .getWalletTokens(this._currentWalletId)
      .then(tokens => this._setTokens(tokens));

  _fetchBalance = (token: ERC20Token): Promise<TokenWithBalance> =>
    this._erc20TokenApi
      .getBalanceOf(token.address, this._currentWalletId)
      .then(balance => ({ token, balance }));

  _setTokens = action((tokens: TokensMap) => {
    this.tokens = values(tokens);
  });

  _setBalances = action(balances => {
    this.tokenBalances = balances;
  });

  _setBalance = action((tokenBalance: TokenWithBalance) => {
    this.tokenBalances = assoc(tokenBalance.token.address.toLowerCase())(tokenBalance.balance)(
      this.tokenBalances,
    );
  });
}
