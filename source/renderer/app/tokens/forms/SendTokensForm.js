// @flow strict
import type { Field, Hooks } from 'mobx-react-form';
import type { IntlShape } from 'react-intl';

import { intlValidators, ReactToolboxMobxForm } from '../../utils/ReactToolboxMobxForm';

export class SendTokensForm extends ReactToolboxMobxForm {
  get amountField(): Field {
    return this.$('amount');
  }

  get receiverField(): Field {
    return this.$('receiver');
  }

  constructor(intl: IntlShape, hooks: Hooks<SendTokensForm>) {
    const { required, requiredNumeric } = intlValidators(intl);

    super(
      {
        fields: {
          amount: {
            type: 'number',
            validators: [requiredNumeric]
          },
          receiver: {
            type: 'text',
            validators: [required]
          }
        }
      },
      { hooks }
    );
  }
}
