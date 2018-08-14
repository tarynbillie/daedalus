// @flow
import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import React from 'react';
import type { IntlShape } from 'react-intl';
import { injectIntl } from 'react-intl';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import { Observable, Observer, Subscription } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { pipe } from 'ramda';

import { nonEmpty } from '../../utils';
import { withStore } from '../../utils/mobx';
import { TokenForm } from '../components/TokenForm';
import { TokenForm as TokenFormModel } from '../forms/TokenForm';
import type { ERC20Check } from '../services/EtcERC20TokenApi';
import { TokenStore } from '../stores/TokenStore';

interface AddTokenFormProps {
  intl: IntlShape;
  tokenStore: TokenStore;
}

type AddTokenFormState = {
  checking: boolean;
  check: null | ERC20Check;
}

const CheckResult = (props: { check: ERC20Check | null }) =>
  props.check && (
    <span>
      {props.check.isERC20
        ? 'Contract at given address seems to be a valid ERC-20 token'
        : "This contract doesn't seem to be a valid ERC-20 token"}
    </span>
  );

class AddTokenFormComponent extends React.PureComponent<AddTokenFormProps, AddTokenFormState> {
  tokenForm = new TokenFormModel(this.props.intl, {
    onSuccess: () => {
      this._addToken();
    }
  });
  subscription: Subscription;

  state: AddTokenFormState = {
    checking: false,
    check: null,
  };

  componentDidMount() {
    this.subscription = Observable.create((obs: Observer<Field>) => {
      this.tokenForm.addressField.observe(({ field }) => {
        obs.next(field);
      });
    })
      .pipe(
        debounceTime(200),
        tap(() => this.setState({ check: null })),
        map(field => field.value),
        filter(nonEmpty),
        tap(() => this.setState({ checking: true })),
        switchMap(this._checkAddress)
      )
      .subscribe(check => {
        check.name.map(name => this.tokenForm.nameField.set(name));
        check.symbol.map(symbol => this.tokenForm.symbolField.set(symbol));
        check.decimals.map(decimals => this.tokenForm.decimalsField.set(decimals.toString()));
        this.tokenForm.validate();
        this.setState({ checking: false, check });
      }, console.error);
  }

  render() {
    return (
      <TokenForm
        form={this.tokenForm}
        disabled={this.state.checking}
        disableReason={<p>Checking address...</p>}
      >
        <div>
          <CheckResult check={this.state.check} />
          <Button
            skin={<SimpleButtonSkin />}
            label="Add token"
            disabled={!this._canAddToken()}
            onClick={this.tokenForm.onSubmit}
          />
        </div>
      </TokenForm>
    );
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  _checkAddress = (address: string) => this.props.tokenStore.checkAddress(address);

  _canAddToken = () => !!this.state.check && this.state.check.isERC20 && this.tokenForm.isValid;

  _addToken = () =>
    this.props.tokenStore.addToken({
      address: this.tokenForm.addressField.value,
      name: this.tokenForm.nameField.value,
      symbol: this.tokenForm.symbolField.value,
      decimals: parseInt(this.tokenForm.decimalsField.value, 10)
    });
}

export const AddTokenForm = pipe(
  injectIntl,
  observer,
  withStore('tokens', 'tokenStore')
)(AddTokenFormComponent);
