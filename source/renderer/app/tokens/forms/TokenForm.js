// @flow strict
import type { Field, Hooks } from 'mobx-react-form';
import { prop } from 'ramda';
import type { IntlShape } from 'react-intl';

import { intlValidators, ReactToolboxMobxForm } from '../../utils/ReactToolboxMobxForm';

export class TokenForm extends ReactToolboxMobxForm {
  get addressField(): Field {
    return this.$('address');
  }

  get nameField(): Field {
    return this.$('name');
  }

  get symbolField(): Field {
    return this.$('symbol');
  }

  get decimalsField(): Field {
    return this.$('decimals');
  }

  constructor(intl: IntlShape, hooks?: Hooks<TokenForm>) {
    const { required, requiredNumeric } = intlValidators(intl);
    const declarations = [
      {
        name: 'address',
        label: 'Address',
        validators: [required]
      },
      {
        name: 'name',
        label: 'Name',
        validators: [required]
      },
      {
        name: 'symbol',
        label: 'Symbol',
        validators: [required]
      },
      {
        name: 'decimals',
        label: 'Decimals',
        type: 'number',
        validators: [requiredNumeric]
      }
    ];

    super({ fields: declarations }, { hooks });
  }

  hasAddressOnly(): boolean {
    const hasAddress = !!this.addressField.value;
    const hasOtherValue = [this.nameField, this.symbolField, this.decimalsField].map(prop('value')).some(value => !!value);

    return hasAddress && !hasOtherValue;
  }
}
