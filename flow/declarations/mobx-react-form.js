// @flow
declare module 'mobx-react-form' {
  declare export interface FieldDeclarationWithoutName {
    +type?: string;
  }

  declare export interface FieldDeclarationWithName extends FieldDeclarationWithoutName {
    +name: string;
  }

  declare export type FieldDeclaration = FieldDeclarationWithoutName | FieldDeclarationWithName;

  declare type FieldError = string;

  declare export class Field<T = string> implements FieldDeclarationWithName {
    +name: string;
    +label: string;
    +type: string;
    value: T;
    +isValid: boolean;
    +isDirty: boolean;
    +error: FieldError;
    +debouncedValidation: {
      cancel(): void;
    };
    observe(cb: ({ form: MobxReactForm<>, field: Field<>, change: Change }) => void): void;
    reset(): void;
    bind(): {value: string};
    set(val: string): void;
    onChange(val: string): void;
    onFocus(): void;
    onBlur(): void;
  }

  declare export type Change = {
    +path: string
  };

  declare type Plugin = any;

  declare export type Hooks<T: MobxReactForm<> = MobxReactForm<>> = {
    onSuccess?: T => void,
    onError?: T => void
  };

  declare export default class MobxReactForm<T: {} = { [string]: string }> {
    +isValid: boolean;

    constructor(
      fields: { fields: FieldDeclarationWithName[] | { [string]: FieldDeclarationWithoutName } },
      hooksAndPlugins?: { plugins?: { [string]: Plugin }, hooks?: Hooks<*> }
    ): void;

    $<T>(name: string): Field<T>;
    submit(hooks: Hooks<*>): void;
    values(): T;
    validate(): void;
    showErrors(shouldShow: boolean): void;
    each(cb: Field<$Values<T>> => void): void;
    reset(): void;

    onSubmit(): void;
  }
}
