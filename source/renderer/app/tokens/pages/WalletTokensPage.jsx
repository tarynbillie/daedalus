// @flow strict
import React from 'react';

import { AddTokenForm } from '../containers/AddTokenForm';
import { TokensList } from '../containers/TokensList';

export default class WalletTokensPage extends React.Component<{}> {
  render() {
    return (
      <div>
        <TokensList />
        <AddTokenForm />
      </div>
    );
  }
}
