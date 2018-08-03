// @flow strict
import { observer } from 'mobx-react';
import React from 'react';
import { pipe } from 'sanctuary';

import { withStore } from '../../utils/mobx';
import { TokenStore } from '../stores/TokenStore';

export const TokensList = pipe([observer, withStore('tokens', 'tokenStore')])(
  (props: { tokenStore: TokenStore }) => (
    <div>
      {props.tokenStore.tokens.map(token => (
        <div key={token.address}>
          Token
          <pre>{JSON.stringify(token, null, 4)}</pre>
          Balance
          <pre>{props.tokenStore.getBalance(token)}</pre>
        </div>
      ))}
    </div>
  )
);
