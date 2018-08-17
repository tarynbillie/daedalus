declare module 'mobx-react-form' {
  declare export interface FieldDeclarationWithoutName {
    +type?: string;
  }

  declare export interface FieldDeclarationWithName extends FieldDeclarationWithoutName {
    +name: string;
  }

  declare export type FieldDeclaration = FieldDeclarationWithoutName | FieldDeclarationWithName;

  declare type FieldError = string;

  declare export class Field implements FieldDeclarationWithName {
    +name: string;
    +type: string;
    value: string;
    +isValid: boolean;
    +error: FieldError;
    observe(cb: ({ form: MobxReactForm, field: Field, change: Change }) => void): void;
    reset(): void;
    bind(): {value: string};
    set(val: string): void;
    onChange(val: string): void;
  }

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
      fields: { fields: FieldDeclarationWithName[] | { [string]: FieldDeclarationWithoutName } },
      hooksAndPlugins?: { plugins?: { [string]: Plugin }, hooks?: Hooks<*> }
    ): void;

    $(name: string): Field;
    submit(hooks: Hooks<>): void;
    values(): { [string]: string };
    validate(): void;
    showErrors(shouldShow: boolean): void;
    each(cb: Field => void): void;
    reset(): void;

    onSubmit(): void;
  }
}
