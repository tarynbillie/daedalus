// @flow strict
import Maybe from 'data.maybe';
import { always, assoc, curry, map, pipe, find } from 'ramda';

import { generateMnemonic } from './crypto';

export default {
  crypto: {
    generateMnemonic,
  },
};

export type UnaryFn<A, R> = (a: A) => R;

export const forEach = <T>(iteratee: T => void) => (collection: Functor<T> | Maybe<T>): void => {
  map(iteratee, collection);
};

export const nonEmpty = (val: string) => !!val;
// $FlowIssue
export const notNull = (val: any) => val != null;
export const isFalse = (val: boolean) => val === false;

// $FlowIssue
export const taggedLog = (tag: string) => (...args: any[]) => console.log(`[${tag}]`, ...args);
// $FlowIssue
export const taggedError = (tag: string) => (...args: any[]) => console.error(`[${tag}]`, ...args);

export type Dict<T> = { [string]: T };
export const toDict = curry(
  <T>(key: T => string, items: T[]): Dict<T> => items.reduce((dict: Dict<T>, item) => assoc(key(item), item, dict), {}),
);

export const toNothing = always(Maybe.Nothing);

export const findMaybe = <T>(predicate: T => boolean) =>
  pipe(
    find(predicate),
    Maybe.fromNullable,
  );

type Fns<T, R> = ((ab: UnaryFn<T, R>) => R) &
  (<B>(ab: UnaryFn<T, B>, bc: UnaryFn<B, R>) => R) &
  (<B, C>(ab: UnaryFn<T, B>, bc: UnaryFn<B, C>, cd: UnaryFn<C, R>) => R) &
  (<B, C, D>(ab: UnaryFn<T, B>, bc: UnaryFn<B, C>, cd: UnaryFn<C, D>, de: UnaryFn<D, R>) => R) &
  (<B, C, D, E>(ab: UnaryFn<T, B>, bc: UnaryFn<B, C>, cd: UnaryFn<C, D>, de: UnaryFn<D, E>, ef: UnaryFn<E, R>) => R) &
  (<B, C, D, E, F>(
    ab: UnaryFn<T, B>,
    bc: UnaryFn<B, C>,
    cd: UnaryFn<C, D>,
    de: UnaryFn<D, E>,
    ef: UnaryFn<E, F>,
    fg: UnaryFn<F, R>,
  ) => R);

// $FlowIssue
export const pass = <T, R>(item: T): Fns<T, R> => (...fns): R => fns.reduce((r, fn) => fn(r), item);
