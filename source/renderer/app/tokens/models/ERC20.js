// @flow strict
import { Maybe, isJust, insert } from 'sanctuary';

export interface ERC20Meta {
  name: Maybe<string>;
  symbol: Maybe<string>;
  decimals: Maybe<number>;
  allowance: Maybe<number>;
  balanceOf: Maybe<number>;
  totalSupply: Maybe<number>;
}

export interface ERC20Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export type TokensMap = { [string]: ERC20Token };

export const isValidERC20 = (meta: ERC20Meta): boolean =>
  isJust(meta.allowance) && isJust(meta.balanceOf) && isJust(meta.totalSupply);

export const containsMetadata = (meta: ERC20Meta): boolean =>
  isJust(meta.name) && isJust(meta.symbol) && isJust(meta.decimals);

export const isValidERC20WithMetadata = (meta: ERC20Meta): boolean =>
  isValidERC20(meta) && containsMetadata(meta);

export const addToken = (token: ERC20Token) => (tokens: TokensMap): TokensMap =>
  insert(token.address)(token)(tokens);
