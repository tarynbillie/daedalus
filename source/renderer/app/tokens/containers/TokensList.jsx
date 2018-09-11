// @flow
import { observer } from 'mobx-react';
import { memoizeWith, pipe, always } from 'ramda';
import React from 'react';
import { injectIntl } from 'react-intl';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import type { IntlShape } from 'react-intl';

import Dialog from '../../components/widgets/Dialog';
import DialogCloseButton from '../../components/widgets/DialogCloseButton';
import { withStore } from '../../utils/mobx';
import { SendTokens } from '../components/SendTokens';
import { SendTokensForm } from '../forms/SendTokensForm';
import type { ERC20Token } from '../models/ERC20';
import { TokenStore } from '../stores/TokenStore';

type TokensListState = {
  sendingToken: ERC20Token | null,
  sendingForm: SendTokensForm | null,
  resultMessage: string | null
};

export const TokensList = pipe(
  observer,
  withStore('tokens', 'tokenStore'),
  injectIntl
)(
  class TokensListComponent extends React.Component<
    { tokenStore: TokenStore, intl: IntlShape },
    TokensListState
  > {
    state = {
      sendingToken: null,
      sendingForm: null,
      resultMessage: null
    };

    render() {
      return (
        <div>
          {this.props.tokenStore.tokens.map(token => (
            <div key={token.address}>
              Token
              <pre>{JSON.stringify(token, null, 4)}</pre>
              Balance
              <pre>{this.props.tokenStore.getBalance(token)}</pre>
              <Button
                skin={ButtonSkin}
                label="Stop watching"
                onClick={this._stopWatching(token)}
              />
              <Button
                skin={ButtonSkin}
                label="Send"
                onClick={this._openSendForm(token)}
              />
            </div>
          ))}
          {this.state.sendingToken
            && this.state.sendingForm && (
              <div>
                <Dialog
                  closeOnOverlayClick
                  onClose={this._closeSendForm}
                  closeButton={<DialogCloseButton onClose={this._closeSendForm} />}
                >
                  <SendTokens form={this.state.sendingForm} token={this.state.sendingToken} />
                </Dialog>
              </div>
            )}
          {this.state.resultMessage && <div>{this.state.resultMessage}</div>}
        </div>
      );
    }

    _stopWatching = memoizeWith(x => x.address, (token: ERC20Token) => () => this.props.tokenStore.stopWatching(token)
    );

    _openSendForm = memoizeWith(x => x.address, (token: ERC20Token) => () => this.setState({
        sendingToken: token,
        sendingForm: new SendTokensForm(this.props.intl, {
          onSuccess: form => {
            this.props.tokenStore
              .sendTokens(token, parseInt(form.amountField.value, 10), form.receiverField.value)
              .catch(always(false))
              .then(this._showResultMessage)
              .then(this._closeSendForm);
          }
        })
      })
    );

    _closeSendForm = () => this.setState({ sendingToken: null, sendingForm: null });

    _showResultMessage = (result: boolean) => this.setState({
        resultMessage: result
          ? 'Tokens were sent successfully'
          : 'An error occurred when sending tokens'
      });
  }
);
