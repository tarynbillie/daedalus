// @flow strict
import { computed } from 'mobx';
import { inject } from 'mobx-react';
import type { ComponentType } from 'react';
import { Observable } from 'rxjs';

import type { StoresMap } from '../stores';

export const withStore = <M: string, S: string>(module: M, store: S) => <T>(
  Component: ComponentType<T & { [S]: $ElementType<$ElementType<StoresMap, M>, S> }>,
) =>
  inject(({ stores }: { stores: StoresMap }) => ({
    [store]: stores[module][store],
  }))(Component);

// mobx typings so good...
type Change<T> = {
  newValue?: T,
};

export const asObservable = <T>(getter: () => T): Observable<Change<T>> =>
  Observable.create(observer =>
    computed(getter).observe((newVal: Change<T>) => observer.next(newVal)),
  );
