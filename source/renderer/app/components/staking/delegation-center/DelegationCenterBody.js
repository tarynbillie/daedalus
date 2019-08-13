// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { map, includes, find } from 'lodash';
import { defineMessages, intlShape } from 'react-intl';
import { rangeMap } from '../../../utils/rangeMap';
import Wallet from '../../../domains/Wallet';
import WalletRow from './WalletRow';
import styles from './DelegationCenterBody.scss';

const messages = defineMessages({
  bodyTitle: {
    id: 'staking.delegationCenter.bodyTitle',
    defaultMessage: '!!!Wallets',
    description: 'Title for the Delegation center body section.',
  },
});

type Props = {
  wallets: Array<Wallet>,
  onDelegate: Function,
};

@observer
export default class DelegationCenterBody extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  getIndex = (ranking: number) => {
    const { wallets, delegatedWallets } = this.props;

    return rangeMap(
      ranking,
      1,
      delegatedWallets.length,
      0,
      99
    );
  };

  render() {
    const { intl } = this.context;
    const { wallets, onDelegate, delegatedWallets, onSelectDelegatedWalletActionOption } = this.props;

    const delegatedWalletsIds = map(delegatedWallets, wallet => wallet.walletId);

    const title = intl.formatMessage(messages.bodyTitle);

    return (
      <div className={styles.component}>
        <div className={styles.bodyTitle}>
          <span>{title}</span>
        </div>
        <div className={styles.mainContent}>
          {wallets.map(wallet => {
            const isDelegated = includes(delegatedWalletsIds, wallet.id);
            if (isDelegated) {
              const delegatedWallet = find(delegatedWallets, data => data.walletId === wallet.id);
              if (delegatedWallet) {
                return (
                  <WalletRow
                    key={wallet.id}
                    wallet={wallet}
                    index={delegatedWallet.selectedPool.ranking}
                    isDelegated
                    delegatedStakePool={delegatedWallet.selectedPool}
                    onDelegate={onDelegate}
                    onSelectDelegatedWalletActionOption={onSelectDelegatedWalletActionOption}
                  />
                );
              }
            }
            return (
              <WalletRow
                key={wallet.id}
                wallet={wallet}
                onDelegate={onDelegate}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
