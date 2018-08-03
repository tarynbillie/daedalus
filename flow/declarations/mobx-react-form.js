declare module 'mobx-react-form' {
  declare export type FieldDeclaration = {
    +name: string,
    +type?: string
  };

  declare export type Field = FieldDeclaration & {
    +value: string,
    +bind: () => {},
    +observe: (cb: ({ form: MobxReactForm, field: Field, change: Change }) => void) => void,
    +reset: () => void,
  };

  declare export type Change = {
    +path: string
  };

  declare type Plugin = any;

  declare export type Hooks<T: MobxReactForm = MobxReactForm> = {
    onSuccess?: T => void,
    onError?: T => void
  };

  declare export default class MobxReactForm {
    +isValid: boolean;

    constructor(
      fields: { fields: FieldDeclaration[] },
      hooksAndPlugins?: { plugins?: { [string]: Plugin }, hooks?: Hooks }
    ): void;

    $(name: string): Field;
  }
}
