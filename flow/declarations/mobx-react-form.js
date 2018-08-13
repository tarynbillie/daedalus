declare module 'mobx-react-form' {

  declare export type FieldDeclarationWithoutName = {
    +type?: string;
  }

  declare export type FieldDeclarationWithName = FieldDeclarationWithoutName & {
    +name: string;
  }
  declare export type FieldDeclaration = FieldDeclarationWithoutName | FieldDeclarationWithName;

  declare type FieldError = string;

  declare export type Field = FieldDeclarationWithName & {
    +value: string,
    +isValid: boolean,
    +error: FieldError,
    +observe: (cb: ({ form: MobxReactForm, field: Field, change: Change }) => void) => void,
    +reset: () => void,
    bind (): {},
    set (val: string): void,
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
      fields: { fields: (FieldDeclarationWithName[] | {[string]: FieldDeclarationWithoutName }) },
      hooksAndPlugins?: { plugins?: { [string]: Plugin }, hooks?: Hooks<> }
    ): void;

    $(name: string): Field;
    submit(hooks: Hooks<>): void;
    values(): {[string]: string};

    onSubmit(): void;
  }
}
