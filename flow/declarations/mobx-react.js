declare module 'mobx-react' {
  declare export function observer<T>(_component: T): T;
  declare export function inject<K>(name: K): <T, S>(component: React.ComponentType<T & {[K]: S}>) => React.ComponentType<T>;
  declare export class Provider<T> extends React.Component<T> {}
}
