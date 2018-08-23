// @flow strict
import Maybe from 'data.maybe';
import { equals } from 'ramda';
import { concat, interval, Observable, of } from 'rxjs';
import { catchError, concatMap, distinctUntilChanged, map, mapTo } from 'rxjs/operators';

import { Logger } from '../../../common/logging';
import type { SyncProgress } from './SyncProgress';
import { isCompleted, toPercentage } from './SyncProgress';

const OUT_OF_SYNC_BLOCKS_LIMIT = 6;

type NetworkStatusParams = {
  isConnected: boolean,
  syncProgress: Maybe<SyncProgress>,
};

export type FullNetworkStatus = NetworkStatusParams & {
  isConnecting: boolean,
  hasSyncingStarted: boolean,
  isSyncing: boolean,
  isSynced: boolean,
  syncPercentage: number,
};

const NetworkStatus = (data: NetworkStatusParams): FullNetworkStatus => ({
  ...data,
  isConnecting: !data.isConnected,
  hasSyncingStarted: data.syncProgress.isJust,
  isSyncing: data.isConnected && data.syncProgress.isJust, // these two fields are redundant
  isSynced: data.syncProgress
    .map(isCompleted(OUT_OF_SYNC_BLOCKS_LIMIT))
    .getOrElse(data.isConnected),
  syncPercentage: data.syncProgress.map(toPercentage).getOrElse(data.isConnected ? 100 : 0),
});

export const defaultNetworkStatus: FullNetworkStatus = {
  isConnected: false,
  syncProgress: Maybe.Nothing(),
  isConnecting: true,
  hasSyncingStarted: false,
  isSyncing: false,
  isSynced: false,
  syncPercentage: 0,
};

export const peerCountConnectionChecker = (
  checkInterval: number,
  getPeerCount: () => Promise<number>,
  logger: typeof Logger,
): Observable<boolean> =>
  interval(checkInterval).pipe(
    concatMap(getPeerCount),
    catchError((err, src$) => {
      logger.error(err);
      return concat(of(0), src$);
    }),
    map(x => x > 1),
  );

export const validResponseConnectionChecker = (
  checkInterval: number,
  doRequest: () => Promise<*>,
  logger: typeof Logger,
): Observable<boolean> =>
  interval(checkInterval).pipe(
    concatMap(doRequest),
    mapTo(true),
    catchError((err, src$) => {
      logger.error(err);
      return concat(of(false), src$);
    }),
  );

export const networkStatusFactory = (
  connectionStatus$: Observable<boolean>,
  getSyncProgress: () => Promise<Maybe<SyncProgress>>,
): Observable<FullNetworkStatus> =>
  connectionStatus$.pipe(
    concatMap(isConnected =>
      getSyncProgress()
        .catch(() => Maybe.Nothing())
        .then(syncProgress => ({ isConnected, syncProgress })),
    ),
    map(NetworkStatus),
    distinctUntilChanged(equals),
  );
