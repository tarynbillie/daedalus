// @flow strict
import ExtendableError from 'es6-error';

export default class LocalizableError extends ExtendableError {
  id: string;
  description: string = '';
  defaultMessage: string;
  values: {[string]: string};

  constructor(
    { id, defaultMessage, values = {} }:
    { id: string, defaultMessage: string, values?: {[string]: string}}
  ) {
    if (!id) throw new Error('id:string is required.');
    if (!defaultMessage) throw new Error('defaultMessage:string is required.');
    super(`${id}: ${JSON.stringify(values)}`);
    this.id = id;
    this.defaultMessage = defaultMessage;
    this.values = values;
  }
}
