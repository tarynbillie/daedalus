// @flow strict
import { mergeWith } from 'ramda';

export const applyDefaults = <T: {}>(defaults: $Shape<T>, data: T): T => mergeWith((current, def) => (current === undefined || current === null) ? def : current, data, defaults);

export const merge = <T, K>(t: T, k: K): T & K => Object.assign({}, t, k);
