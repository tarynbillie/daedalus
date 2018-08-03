// @flow strict
import { computed } from 'mobx';
import { inject } from 'mobx-react';
import React from 'react';
import { Observable } from 'rxjs';

import type { StoresMap } from '../stores';

export const withStore = <M: $Keys<StoresMap>, S: $Keys<$PropertyType<StoresMap, M>>>(
  module: M,
  store: S
) => <T>(
  Component: React.ComponentType<T & { [S]: $PropertyType<$PropertyType<StoresMap, M>, S> }>
) =>
  inject(({ stores }: { stores: StoresMap }) => ({
    [store]: stores[module][store]
  }))(Component);

export const asObservable = <T>(getter: () => T): Observable<T> =>
  Observable.create(observer => computed(getter).observe(newVal => observer.next(newVal)));
