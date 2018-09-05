// @flow strict
import { Subscription } from 'rxjs';

import type { StoreLifecycle } from './Store';

export class RxStore implements StoreLifecycle {
  _subscriptions: Subscription[] = [];

  setup(): Subscription[] {
    return [];
  }

  initialize() {
    this._subscriptions = this.setup();
  }

  teardown() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }
}
