// @flow strict
import ExtendableError from 'es6-error';

// Cannot be expressed nicely but it implements MessageDescriptor from 'react-intl'
export default class LocalizableError extends ExtendableError {
  id: string;
  // Flow is so retarded that optional field syntax is supported only in type declarations and interfaces,
  // it's completely incompatible with nullable type so:
  // - description?: string
  // description: ?string
  // Are completely incompatible types and there is no way to declare optional field in this class <3
  // $FlowIssue
  description: ?string;
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
