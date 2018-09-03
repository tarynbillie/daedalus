// @flow strict
import { BigNumber } from 'bignumber.js';

export const bigNumberToHexString = (val: BigNumber): string => '0x' + val.toString(16);

export const hexStringToNumber = (x: string) => parseInt(x, 16);
export const hexStringToBigNumber = (x: string): BigNumber => new BigNumber(x);
