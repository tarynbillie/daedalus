// @flow strict
import React from 'react';
import type { Node } from 'react';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';
import NumericInput from 'react-polymorph/lib/components/NumericInput';
import { observer } from 'mobx-react';
import type { Field } from 'mobx-react-form';

import BorderedBox from '../../components/widgets/BorderedBox';
import styles from './styles/TokenForm.scss';
import { TokenForm as TokenFormModel } from '../forms/TokenForm';

interface TokenFormProps {
  form: TokenFormModel;
  disabled?: boolean;
  disableReason?: Node;
  children?: Node;
}

@observer
export class TokenForm extends React.PureComponent<TokenFormProps> {
  render() {
    return (
      <BorderedBox>
        <form onSubmit={this.props.form.onSubmit}>
          {this._renderInput(this.props.form.addressField)}
          {this._renderInput(this.props.form.nameField)}
          {this._renderInput(this.props.form.symbolField)}
          {this._renderInput(this.props.form.decimalsField)}
          {this.props.disabled && this.props.disableReason}
          {this.props.children}
        </form>
      </BorderedBox>
    );
  }

  _renderInput = (field: Field) => (
    <div className={styles.inputWrapper}>
      {field.type === 'number' ? (
        <NumericInput
          {...field.bind()}
          skin={<SimpleInputSkin />}
          type="string"
          disabled={this.props.disabled}
          maxAfterDot={0}
          minValue={0}
        />
      ) : (
        <Input {...field.bind()} skin={<SimpleInputSkin />} disabled={this.props.disabled} />
      )}
    </div>
  );
}
