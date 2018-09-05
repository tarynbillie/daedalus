// @flow strict

export const reduce = <A, B>(reducer: (acc: A, element: B) => A, init: A): ((B[]) => A) => (elements: B[]): A => elements.reduce(reducer, init);
