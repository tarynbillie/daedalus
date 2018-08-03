// @flow strict
import React from 'react';

import { AddTokenForm } from '../containers/AddTokenForm';
import { Erc20Checker } from '../containers/Erc20Checker';
import { TokensList } from '../containers/TokensList';

export default class WalletTokensPage extends React.Component<{}> {
  render() {
    return (
      <div>
        {/*<Erc20Checker />*/}
        <TokensList />
        <AddTokenForm />
      </div>
    );
  }
}
