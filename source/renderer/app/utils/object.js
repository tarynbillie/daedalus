// @flow strict
import { mergeWith } from 'ramda';

export const applyDefaults = <T: {}>(defaults: $Shape<T>, data: T): T =>
  mergeWith((current, def) => current === undefined ? def : current, data, defaults);
