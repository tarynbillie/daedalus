// @flow strict
import { map } from 'ramda';

export const mapMatching = <T, K>(matcher: T => boolean, mapper: T => K) =>
  map(item => (matcher(item) ? mapper(item) : item));
