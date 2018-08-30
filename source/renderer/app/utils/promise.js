// @flow strict

export const tryAsync = <T>(provider: () => T): Promise<T> => Promise.resolve().then(provider);
