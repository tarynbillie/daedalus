// @flow strict
import { observer } from 'mobx-react';
import React from 'react';
import Input from 'react-polymorph/lib/components/Input';
import Button from 'react-polymorph/lib/components/Button';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import NumericInput from 'react-polymorph/lib/components/NumericInput';

import { SendTokensForm } from '../forms/SendTokensForm';
import type { ERC20Token } from '../models/ERC20';

export const SendTokens = observer((props: { form: SendTokensForm, token: ERC20Token }) => (
  <form onSubmit={props.form.onSubmit}>
    <header>{props.token.name}</header>
    <Input {...props.form.receiverField.bind()} skin={<SimpleInputSkin />} label="Receiver" />
    <Input {...props.form.amountField.bind()} skin={<SimpleInputSkin />} label="Amount" />
    <Button skin={<SimpleButtonSkin />} label="Send" onClick={props.form.onSubmit} disabled={!props.form.isValid} />
  </form>
));
