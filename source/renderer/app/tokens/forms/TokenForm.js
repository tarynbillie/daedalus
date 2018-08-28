// @flow strict
import type { Field, Hooks } from 'mobx-react-form';
import type { IntlShape } from 'react-intl';

import { intlValidators, ReactToolboxMobxForm } from '../../utils/ReactToolboxMobxForm';

export class TokenForm extends ReactToolboxMobxForm {
  get addressField(): Field<string> {
    return this.$('address');
  }

  get nameField(): Field<string> {
    return this.$('name');
  }

  get symbolField(): Field<string> {
    return this.$('symbol');
  }

  get decimalsField(): Field<number> {
    return this.$('decimals');
  }

  constructor(intl: IntlShape, hooks?: Hooks<TokenForm>) {
    const { required, requiredNumeric } = intlValidators(intl);
    const declarations = [
      {
        name: 'address',
        label: 'Address',
        validators: [required],
      },
      {
        name: 'name',
        label: 'Name',
        validators: [required],
      },
      {
        name: 'symbol',
        label: 'Symbol',
        validators: [required],
      },
      {
        name: 'decimals',
        label: 'Decimals',
        type: 'number',
        validators: [requiredNumeric],
      },
    ];

    super({ fields: declarations }, { hooks });
  }

  hasAddressOnly(): boolean {
    const hasAddress = !!this.addressField.value;
    const hasOtherValue = [this.nameField, this.symbolField, this.decimalsField]
      .map(x => x.value)
      .some(value => !!value);

    return hasAddress && !hasOtherValue;
  }
}
