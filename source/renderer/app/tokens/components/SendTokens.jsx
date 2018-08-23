// @flow
import { observer } from 'mobx-react';
import React from 'react';
import { Input } from 'react-polymorph/lib/components/Input';
import { Button } from 'react-polymorph/lib/components/Button';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

import { SendTokensForm } from '../forms/SendTokensForm';
import type { ERC20Token } from '../models/ERC20';

export const SendTokens = observer((props: { form: SendTokensForm, token: ERC20Token }) => (
  <form onSubmit={props.form.onSubmit}>
    <header>{props.token.name}</header>
    <Input {...props.form.receiverField.bind()} skin={InputSkin} label="Receiver" />
    <Input {...props.form.amountField.bind()} skin={InputSkin} label="Amount" />
    <Button skin={ButtonSkin} label="Send" onClick={props.form.onSubmit} disabled={!props.form.isValid} />
  </form>
));
