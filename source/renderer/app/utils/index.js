// @flow strict
import Maybe from 'data.maybe';
import { always, assoc, map } from 'ramda';

import { generateMnemonic } from './crypto';

export default {
  crypto: {
    generateMnemonic
  }
};

interface Functor<A> extends Iterable<A> {
  map<B>(cb: (A) => B): Functor<B>;
}

export const forEach = <T>(iteratee: T => void) => (collection: Functor<T>): void => {
  map(iteratee, collection);
};

export const nonEmpty = (val: string) => !!val;
// $FlowIssue
export const notNull = (val: any) => val != null;

// $FlowIssue
export const taggedLog = (tag: string) => (...args: any[]) => console.log(`[${tag}]`, ...args);

export const toDict = <T, K: string>(key: T => K) => (items: T[]): { [K]: T } =>
  items.reduce((map, item) => assoc(key(item))(item)(map), {});

export const traverse = <A, B>(fn: A => B | Promise<B>) => (arr: Functor<A>) =>
  Promise.all(arr.map(fn));

export const toNothing = always(Maybe.Nothing);
