// @flow strict
export type Fn0 = <A>() => A;
export type Fn1 = <A, B>(B) => A;

export type Fn = Fn0 | Fn1;
