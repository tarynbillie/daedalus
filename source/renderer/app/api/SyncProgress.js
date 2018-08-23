// @flow strict
import Maybe from 'data.maybe';

import * as etcApi from './etc/getEtcSyncProgress';
import type { EtcSyncProgress } from './etc/types';

export type SyncProgress = {
  completed: number,
  total: number,
};

export const isCompleted = (margin: number) => (progress: SyncProgress) =>
  difference(progress) <= margin;
export const isStarted = (progress: SyncProgress) => progress.completed >= 1;

export const toPercentage = (progress: SyncProgress): number =>
  progress.total <= 0 ? 0 : (progress.completed / progress.total) * 100;

export const difference = (progress: SyncProgress): number => progress.total - progress.completed;

export const getEtcSyncProgress = (ca: string): Promise<Maybe<SyncProgress>> =>
  etcApi.getEtcSyncProgress({ ca })
    .then(etcSyncProgressToSyncProgress);

const etcSyncProgressToSyncProgress = (etcProgress: EtcSyncProgress) =>
  etcProgress
    ? Maybe.Just({
      completed: etcProgress.currentBlock,
      total: etcProgress.highestBlock,
    })
    : Maybe.Nothing();
