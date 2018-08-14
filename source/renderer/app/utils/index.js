// @flow strict
import Maybe from 'data.maybe';
import { always, assoc, curry, map, pipe, find } from 'ramda';

import { generateMnemonic } from './crypto';

export default {
  crypto: {
    generateMnemonic
  }
};

interface Functor<A> extends Iterable<A> {
  map<B>(cb: (A) => B): Functor<B>;
}

export const forEach = <T>(iteratee: T => void) => (collection: Functor<T> | Maybe<T>): void => {
  map(iteratee, collection);
};

export const nonEmpty = (val: string) => !!val;
// $FlowIssue
export const notNull = (val: any) => val != null;

// $FlowIssue
export const taggedLog = (tag: string) => (...args: any[]) => console.log(`[${tag}]`, ...args);

export type Dict<T> = { [string]: T };
export const toDict = curry(
  <T>(key: T => string, items: T[]): Dict<T> =>
    items.reduce((dict: Dict<T>, item) => assoc(key(item), item, dict), {})
);

export const traverse = <A, B>(fn: A => B | Promise<B>) => (arr: Functor<A>) =>
  Promise.all(arr.map(fn));

export const toNothing = always(Maybe.Nothing);

export const findMaybe = <T>(predicate: T => boolean) =>
  pipe(
    find(predicate),
    Maybe.fromNullable
  );
