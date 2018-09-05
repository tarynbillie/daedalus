// @flow strict
import { BigNumber } from 'bignumber.js';
import Maybe from 'data.maybe';

import { EthRpc } from './etc/EthRpc';
import type { EtcSyncProgress } from './etc/types';

export type SyncProgress = {
  completed: BigNumber,
  total: BigNumber,
};

export const isCompleted = (margin: number) => (progress: SyncProgress) => difference(progress).lessThanOrEqualTo(margin);
export const isStarted = (progress: SyncProgress) => progress.completed.greaterThanOrEqualTo(1);

export const toPercentage = (progress: SyncProgress): BigNumber => progress.total.lessThanOrEqualTo(0) ? new BigNumber(0) : progress.completed.div(progress.total).mul(100);

export const difference = (progress: SyncProgress): BigNumber => progress.total.sub(progress.completed);

export const getEtcSyncProgress = (ethRpc: EthRpc): Promise<Maybe<SyncProgress>> => ethRpc.ethSyncing().then(etcSyncProgressToSyncProgress);

const etcSyncProgressToSyncProgress = (etcProgress: EtcSyncProgress) => etcProgress
    ? Maybe.Just({
        completed: etcProgress.currentBlock,
        total: etcProgress.highestBlock,
      })
    : Maybe.Nothing();
