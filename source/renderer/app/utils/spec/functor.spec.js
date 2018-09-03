// @flow strict
import { BigNumber } from 'bignumber.js';

import type { Val } from '../functor';
import { mapLeafs } from '../functor';

describe('mapLeafs', () => {
  const doubler = x => (typeof x === 'number' ? x * 2 : x);
  const stringifyBigNumber = x => (x instanceof BigNumber) ? x.toString() : x;

  it('should behave like plain map for flat objects', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };
    const expected = {
      a: 2,
      b: 4,
      c: 6,
    };

    const actual = mapLeafs(doubler)(obj);

    expect(actual).toEqual(expected);
  });

  it('should behave like plain map for flat arrays', () => {
    const arr: Val<> = [1, 2, 3];
    const expected = [2, 4, 6];

    const actual = mapLeafs(doubler)(arr);

    expect(actual).toEqual(expected);
  });

  it('should handle properly nested cases', () => {
    const data: Val<> = {
      a: [
        { b: 1 },
        {
          c: {
            d: 2,
          },
          e: 3,
        },
        4,
      ],
      f: {
        g: 5,
        h: {
          i: [6, 7],
        },
      },
    };
    const expected = {
      a: [
        { b: 2 },
        {
          c: {
            d: 4,
          },
          e: 6,
        },
        8,
      ],
      f: {
        g: 10,
        h: {
          i: [12, 14],
        },
      },
    };
    const actual = mapLeafs(doubler)(data);

    expect(actual).toEqual(expected);
  });

  it('should properly handle more complicated objects', () => {
    const obj: {[string]: BigNumber} = {
      a: new BigNumber(1),
      b: new BigNumber(2),
      c: new BigNumber(3),
    };
    const expected = {
      a: '1',
      b: '2',
      c: '3',
    };

    const actual = mapLeafs(stringifyBigNumber)(obj);

    expect(actual).toEqual(expected);
  });
});
