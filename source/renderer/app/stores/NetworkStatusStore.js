// @flow
import { action, computed, observable } from 'mobx';
import { Observable } from 'rxjs';
import { bufferCount, filter, share, take, tap } from 'rxjs/operators';

import { Logger } from '../../../common/logging';
import Action from '../actions/lib/Action';
import type { FullNetworkStatus } from '../api/NetworkStatus';
import { defaultNetworkStatus } from '../api/NetworkStatus';
import { RxStore } from './lib/RxStore';

type CachedState = {
  hasBeenConnected: boolean,
  networkStatus: FullNetworkStatus,
};

// To avoid slow reconnecting on store reset, we cache the most important props
let cachedState: ?CachedState = null;

export default class NetworkStatusStore extends RxStore {
  _startTime = Date.now();
  _isSyncedAndReadyAction: Action<void>;
  _networkStatus$: Observable<FullNetworkStatus>;

  @observable
  hasBeenConnected = false;
  @observable.ref
  networkStatus: FullNetworkStatus = defaultNetworkStatus;

  @computed
  get isConnected(): boolean {
    return this.networkStatus.isConnected;
  }

  @computed
  get isSynced(): boolean {
    return this.networkStatus.isSynced;
  }

  @computed
  get syncPercentage(): number {
    return this.networkStatus.syncPercentage;
  }

  constructor(
    networkStatus$: Observable<FullNetworkStatus>,
    isSyncedAndReadyAction: Action<void>,
  ) {
    super();
    this._networkStatus$ = networkStatus$;
    this._isSyncedAndReadyAction = isSyncedAndReadyAction;
  }

  @action
  initialize() {
    super.initialize();
    Object.assign(this, cachedState);
  }

  setup() {
    const networkStatus$ = this._networkStatus$.pipe(share());
    const connectionLost$ = networkStatus$.pipe(
      bufferCount(2, 1),
      filter(pair => pair.length < 2 || pair[1].isConnected === false),
    );
    const syncCompleted$ = networkStatus$.pipe(filter(x => x.isSynced));

    return [
      networkStatus$.subscribe(action(status => this.networkStatus = status), console.error),
      connectionLost$.subscribe(
        action(() => {
          this.hasBeenConnected = true;
        }),
      ),
      networkStatus$.pipe(take(1)).subscribe(this._logConnectionTime),
      syncCompleted$.pipe(take(1)).subscribe(() => {
        this._isSyncedAndReadyAction.trigger();
        this._logSyncTime();
      }),
    ];
  }

  teardown() {
    super.teardown();
    this._updateCache();
  }

  _getStartupTimeDelta() {
    return Date.now() - this._startTime;
  }

  _logConnectionTime = () =>
    Logger.info(
      `========== Connected after ${this._getStartupTimeDelta()} milliseconds ==========`,
    );

  _logSyncTime = () =>
    Logger.info(`========== Synced after ${this._getStartupTimeDelta()} milliseconds ==========`);

  _updateCache() {
    // Save current state into the cache
    cachedState = {
      hasBeenConnected: this.hasBeenConnected,
      networkStatus: this.networkStatus,
    };
  }
}
