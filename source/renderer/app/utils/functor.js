// @flow strict
import { isPlainObject } from 'lodash';
import { curry, map, mapObjIndexed } from 'ramda';

type Functor<A> = A[] | Iterable<A> & {
  map<B>(cb: (A) => B): Functor<B>;
}

type Dict<T> = { [string]: T };
type SimpleVal = number | string | boolean | null | void;
export type Val<T = void> = Dict<Val<T>> | Array<Val<T>> | SimpleVal | T;
type Path = Array<string | number>;

export const traverseP = <A, B>(fn: A => (Promise<B> | B)) => (arr: A[]): Promise<B[]> => Promise.all(arr.map(fn));

export const mapMatching = <T, K>(matcher: T => boolean, mapper: T => K) =>
  map(item => (matcher(item) ? mapper(item) : item));

export const whenMatching = <T, K>(matcher: T => boolean, mapper: T => K) => (item: T): T | K =>
  matcher(item) ? mapper(item) : item;

export const mapLeafs = <T, U>(mapper: (val: T | SimpleVal, path: Path) => U) => (
  value: Val<T>,
  path: Path = [],
): Val<U> => {
  const leafMapper = mapLeafs(mapper);

  if (Array.isArray(value)) {
    // $FlowIssue
    return (value: Array<Val<T>>).map((val, index) => leafMapper(val, [...path, index]));
  } else if (isPlainObject(value)) {
    return mapObjIndexed(
      // $FlowIssue
      (val, key) => leafMapper(val, [...path, key]),
      (value: {}),
    );
  } else {
    return mapper(value, path);
  }
};

export const mapValues = curry(
  <T, K, In: Dict<*>>(mapper: T => K, dict: In): $ObjMap<In, () => K> =>
    mapObjIndexed(mapper, dict),
);
