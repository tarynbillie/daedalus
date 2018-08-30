// @flow strict
declare module 'electron-store' {
  declare export default class Store {
    get<T>(key: string): T;
    set<T>(key: string, value: T): void;
    delete(key: string): void;
  }
}
