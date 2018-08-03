// @flow strict
import { map } from 'sanctuary';

import { generateMnemonic } from './crypto';

export default {
  crypto: {
    generateMnemonic
  }
};

export const prop = key => obj => obj[key];

export const forEach = <T>(iteratee: T => void) => (collection): void => {
  map(iteratee)(collection);
};

export const nonEmpty = (val: string) => !!val;
export const notNull = val => val != null;

export const taggedLog = tag => (...args) => console.log(`[${tag}]`, ...args);
