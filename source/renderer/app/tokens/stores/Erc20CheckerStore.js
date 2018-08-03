// @flow
import { observable, action } from 'mobx';

import { EtcERC20TokenApi } from '../services/EtcERC20TokenApi';
import WalletStore from '../../stores/WalletStore';

import type { ERC20Check } from '../services/EtcERC20TokenApi';

const waitFor = (time: number) => () =>
  new Promise(resolve => setTimeout(resolve, time));

export class Erc20CheckerStore {
  etcContractApi: EtcERC20TokenApi;
  walletStore: WalletStore;

  @observable.ref result: ?ERC20Check = null;
  @observable.ref contractAddress = null;
  @observable.ref deployedContractAddress = null;

  constructor(etcContractApi: EtcERC20TokenApi, walletStore: WalletStore) {
    this.etcContractApi = etcContractApi;
    this.walletStore = walletStore;
  }

  @action
  checkAddress(address: string): void {
    const activeWallet = this.walletStore.active;

    if (activeWallet) {
      this.result = null;
      this.etcContractApi
        .checkIfERC20Token(address, activeWallet.id)
        .then(action(result => (this.result = result)))
        .catch(action(console.error));
    }
  }

  getContractAddress(txHash: string): void {
    this.etcContractApi
      .getContractAddressFromTransaction(txHash)
      .then(
        action(address => {
          this.contractAddress = address;
        })
      )
      .catch(action(console.error));
  }

  deployContract() {
    if (this.walletStore.active) {
      this.etcContractApi
        .deployContract(this.walletStore.active.id)
        .then(action(address => (this.deployedContractAddress = address)))
        .catch(console.error);
    }
  }
}
