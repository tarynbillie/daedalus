// @flow
import { computed, action, observable } from 'mobx';
import { concat, find, map, reject } from 'lodash';
import BigNumber from 'bignumber.js';
import Store from './lib/Store';
import { ROUTES } from '../routes-config';
import type { StakePool, Reward } from '../api/staking/types';
import { formattedWalletAmount } from '../utils/formatters';

import STAKE_POOLS from '../config/stakingStakePools.dummy.json';
import REWARDS from '../config/stakingRewards.dummy.json';

export default class StakingStore extends Store {
  startDateTime: string = '2019-09-26T00:00:00.161Z';
  decentralizationProgress: number = 10;
  // adaValue: BigNumber = new BigNumber(82650.15);
  adaValue: BigNumber = new BigNumber(0);
  percentage: number = 0;

  // TODO: Remove once testing is done
  @observable activeDelegationCenterMenuItem = 0;
  @observable delegatedFunds = [];

  setup() {
    const { staking } = this.actions;
    staking.goToStakingPage.listen(this._goToStakingPage);
  }

  // =================== PUBLIC API ==================== //

  // GETTERS

  @computed get currentRoute(): string {
    return this.stores.router.location.pathname;
  }

  @computed get isStakingPage(): boolean {
    return this.currentRoute.indexOf(ROUTES.STAKING.ROOT) > -1;
  }

  @computed get stakePools(): Array<StakePool> {
    // return this.stakePoolsRequest.result ? this.stakePoolsRequest.result : [];
    return STAKE_POOLS;
  }

  @computed get delegatingStakePools(): Array<StakePool> {
    // return this.stakePoolsRequest.result ? this.stakePoolsRequest.result : [];
    return [STAKE_POOLS[1], STAKE_POOLS[3], STAKE_POOLS[20], STAKE_POOLS[36]];
  }

  @computed
  get isStakingDelegationCountdown(): boolean {
    return this.currentRoute === ROUTES.STAKING.COUNTDOWN;
  }

  @computed get rewards(): Array<Reward> {
    return REWARDS;
  }

  @computed get delegationData(): Array<any> {
    return this.delegatedFunds;
  }

  @action showCountdown(): boolean {
    return new Date(this.startDateTime).getTime() - new Date().getTime() > 0;
  }

  // TODO: Remove once testing is done
  // 0 => Delegation Center - with countdown
  // 1 => Delegation Center - without countdown
  @action _switchDelegationCenterMenuItem = (option) => {
    this.activeDelegationCenterMenuItem = option;
  };

  @action delegateWalletFunds(walletId: string, amount: number, selectedPoolId: string) {
    const selectedPool = find(STAKE_POOLS, pool => pool.id === selectedPoolId);

    // Check if Wallet already delegated and reject current values
    const delegatedWallet = find(this.delegatedFunds, wallet => wallet.walletId === walletId);
    if (delegatedWallet) {
      this.delegatedFunds = reject(this.delegatedFunds, (o) => o.walletId === walletId);
    }

    this.delegatedFunds = concat(this.delegatedFunds, [{
      walletId,
      amount,
      selectedPool,
    }]);
    this._calculateDelegation(this.delegatedFunds);
  }

  @action removeDelegatedWallet = (walletId: string) => {
    this.delegatedFunds = reject(this.delegatedFunds, (o) => o.walletId === walletId);
    this._calculateDelegation(this.delegatedFunds);
  }

  _calculateDelegation = (delegatedFunds) => {
    const wallets = this.stores.wallets.all;
    let walletsAmountsSum = 0;
    let delegatedAmountsSum = 0;
    map(wallets, wallet => {
      const valueWithoutCurrency = formattedWalletAmount(wallet.amount, false).replace(/,/g, '');
      walletsAmountsSum += parseFloat(valueWithoutCurrency);
    })

    map(this.delegatedFunds, item => {
      delegatedAmountsSum += parseFloat(item.amount.replace(/,/g, ''));
    })

    this.percentage = (delegatedAmountsSum / walletsAmountsSum) * 100;
    this.adaValue = new BigNumber(delegatedAmountsSum);
  }

  _goToStakingPage = () => {
    this.actions.router.goToRoute.trigger({
      route: ROUTES.STAKING.ROOT,
    });
  };
}
