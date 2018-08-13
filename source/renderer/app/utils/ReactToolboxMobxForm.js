// @flow strict
import type { Field } from 'mobx-react-form';
import MobxReactForm from 'mobx-react-form';
import type { IntlShape } from 'react-intl';
import { isEmpty } from 'validator';

import { FieldRequiredError } from '../i18n/errors';

type ValidatorInput = {
  field: Field,
}
const intlValidators = (intl: IntlShape) => ({
  required: ({ field }: ValidatorInput) => [
    !isEmpty(field.value),
    intl.formatMessage(new FieldRequiredError())
  ],
  requiredNumeric: ({ field }: ValidatorInput) => [
    field.value != null,
    intl.formatMessage(new FieldRequiredError())
  ]
});

class ReactToolboxMobxForm extends MobxReactForm {
  bindings() {
    return {
      ReactToolbox: {
        id: 'id',
        name: 'name',
        type: 'type',
        value: 'value',
        label: 'label',
        placeholder: 'hint',
        disabled: 'disabled',
        error: 'error',
        onChange: 'onChange',
        onFocus: 'onFocus',
        onBlur: 'onBlur'
      }
    };
  }
}

export default ReactToolboxMobxForm;
export { ReactToolboxMobxForm, intlValidators };
