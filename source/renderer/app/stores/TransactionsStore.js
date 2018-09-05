// @flow
import { observable, computed, action, extendObservable } from 'mobx';
import _ from 'lodash';

import WalletTransaction from '../domains/WalletTransaction';
import type { GetTransactionsResponse } from '../api/common';
import environment from '../../../common/environment';

import CachedRequest from './lib/LocalizedCachedRequest';
import Store from './lib/Store';

export type TransactionSearchOptionsStruct = {
  searchTerm: string,
  searchLimit: number,
  searchSkip: number,
};

export default class TransactionsStore extends Store {

  INITIAL_SEARCH_LIMIT = 1000;

  SEARCH_LIMIT_INCREASE = 500;

  SEARCH_SKIP = 0;

  RECENT_TRANSACTIONS_LIMIT = 5;

  @observable transactionsRequests: Array<{
    walletId: string,
    recentRequest: CachedRequest<GetTransactionsResponse>,
    allRequest: CachedRequest<GetTransactionsResponse>
  }> = [];

  @observable _searchOptionsForWallets = {};

  setup() {
    // const actions = this.actions[environment.API].transactions;
    // actions.filterTransactions.listen(this._updateSearchTerm);
    // actions.loadMoreTransactions.listen(this._increaseSearchLimit);
  }

  @action _updateSearchTerm = ({ searchTerm }: { searchTerm: string }) => {
    if (this.searchOptions != null) {
      this.searchOptions.searchTerm = searchTerm;
    }
  };

  @action _increaseSearchLimit = () => {
    if (this.searchOptions != null) {
      this.searchOptions.searchLimit += this.SEARCH_LIMIT_INCREASE;
    }
  };

  @computed get recentTransactionsRequest(): CachedRequest<GetTransactionsResponse> {
    const wallet = this.stores[environment.API].wallets.active;
    // TODO: Do not return new request here
    if (!wallet) return new CachedRequest(this.api[environment.API].getTransactions);
    return this.getTransactionsRecentRequest(wallet.id);
  }

  @computed get searchRequest(): CachedRequest<GetTransactionsResponse> {
    const wallet = this.stores[environment.API].wallets.active;
    // TODO: Do not return new request here
    if (!wallet) return new CachedRequest(this.api[environment.API].getTransactions);
    return this.getTransactionsAllRequest(wallet.id);
  }

  @computed get searchOptions(): ?TransactionSearchOptionsStruct {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return null;
    let options = this._searchOptionsForWallets[wallet.id];
    if (!options) {
      // Setup options for each requested wallet
      extendObservable(this._searchOptionsForWallets, {
        [wallet.id]: {
          searchTerm: '',
          searchLimit: this.INITIAL_SEARCH_LIMIT,
          searchSkip: this.SEARCH_SKIP
        }
      });
      options = this._searchOptionsForWallets[wallet.id];
    }
    return options;
  }

  @computed get filtered(): Array<WalletTransaction> {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet || !this.searchOptions) return [];
    const { searchTerm } = this.searchOptions;
    const request = this.getTransactionsAllRequest(wallet.id);
    if (searchTerm && request.result && request.result.transactions) {
      return request.result.transactions.filter(
        transaction => transaction.title.search(new RegExp(searchTerm, 'i')) !== -1
      );
    }
    return request.result ? request.result.transactions : [];
  }

  @computed get recent(): Array<WalletTransaction> {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return [];
    const result = this.getTransactionsRecentRequest(wallet.id).result;
    return result ? result.transactions.slice(0, this.RECENT_TRANSACTIONS_LIMIT) : [];
  }

  @computed get hasAnyFiltered(): boolean {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return false;
    const result = this.getTransactionsAllRequest(wallet.id).result;
    return result ? result.transactions.length > 0 : false;
  }

  @computed get hasAny(): boolean {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return false;
    const result = this.getTransactionsRecentRequest(wallet.id).result;
    return result ? result.transactions.length > 0 : false;
  }

  @computed get totalAvailable(): number {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return 0;
    const result = this.getTransactionsAllRequest(wallet.id).result;
    return result ? result.transactions.length : 0;
  }

  @computed get totalFilteredAvailable(): number {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return 0;
    const result = this.getTransactionsAllRequest(wallet.id).result;
    return result ? result.transactions.length : 0;
  }

  @action refreshTransactionData = () => {
    if (this.stores.networkStatus.isConnected) {
      const allWallets = this.stores[environment.API].wallets.all;
      for (const wallet of allWallets) {
        const recentRequest = this.getTransactionsRecentRequest(wallet.id);
        recentRequest.invalidate({ immediately: false });
        recentRequest.execute({
          walletId: wallet.id,
          limit: this.RECENT_TRANSACTIONS_LIMIT,
          skip: 0,
          searchTerm: '',
        });
        const allRequest = this.getTransactionsAllRequest(wallet.id);
        allRequest.invalidate({ immediately: false });
        allRequest.execute({
          walletId: wallet.id,
          limit: this.INITIAL_SEARCH_LIMIT,
          skip: 0,
          searchTerm: '',
        });
      }
    }
  };

  getTransactionsRecentRequest = (walletId: string): CachedRequest<GetTransactionsResponse> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.recentRequest) return foundRequest.recentRequest;
    return new CachedRequest(this.api[environment.API].getTransactions);
  };

  getTransactionsAllRequest = (walletId: string): CachedRequest<GetTransactionsResponse> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.allRequest) return foundRequest.allRequest;
    return new CachedRequest(this.api[environment.API].getTransactions);
  };

}
