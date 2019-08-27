// @flow
import { pick } from 'lodash';
import { observable, computed, action } from 'mobx';
import BigNumber from 'bignumber.js';
import type {
  WalletSyncState,
  SyncStateStatus,
  DelegationStatus,
} from '../api/wallets/types';
import type { StakePool } from '../api/staking/types';

export const WalletSyncStateStatuses: {
  RESTORING: SyncStateStatus,
  SYNCED: SyncStateStatus,
} = {
  RESTORING: 'restoring',
  SYNCED: 'ready',
};

export const WalletDelegationStatuses: {
  DELEGATING: DelegationStatus,
  NOT_DELEGATING: DelegationStatus,
} = {
  DELEGATING: 'delegating',
  NOT_DELEGATING: 'not_delegating',
};

export type WalletProps = {
  id: string,
  addressPoolGap: number,
  name: string,
  amount: BigNumber,
  hasPassword: boolean,
  passwordUpdateDate: ?Date,
  syncState: WalletSyncState,
  isLegacy: boolean,
  isDelegated: boolean,
  inactiveStakePercentage?: number,
  delegatedStakePool?: StakePool,
};

export default class Wallet {
  id: string = '';
  @observable addressPoolGap: number;
  @observable name: string = '';
  @observable amount: BigNumber;
  @observable hasPassword: boolean;
  @observable passwordUpdateDate: ?Date;
  @observable syncState: ?WalletSyncState;
  @observable isLegacy: boolean;
  @observable isDelegated: boolean;
  @observable inactiveStakePercentage: ?number;
  @observable delegatedStakePool: ?StakePool;

  constructor(data: WalletProps) {
    Object.assign(this, data);
  }

  @action update(other: Wallet) {
    Object.assign(
      this,
      pick(other, [
        'id',
        'addressPoolGap',
        'name',
        'amount',
        'hasPassword',
        'passwordUpdateDate',
        'syncState',
        'isLegacy',
        'isDelegated',
        'inactiveStakePercentage',
        'delegatedStakePool',
      ])
    );
  }

  @computed get hasFunds(): boolean {
    return this.amount > 0;
  }
}
