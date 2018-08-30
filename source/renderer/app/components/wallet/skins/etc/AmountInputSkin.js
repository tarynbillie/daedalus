// @flow
import { BigNumber } from 'bignumber.js';
import React, { Component } from 'react';
import { intlShape } from 'react-intl';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';

import { formattedAmountWithoutTrailingZeros } from '../../../../utils/formatters';
import { messages } from '../AmountInputSkin';

import styles from './AmountInputSkinEtc.scss';

type Props = {
  currency: string,
  fees: ?BigNumber,
  total: ?BigNumber,
  error: boolean,
};

export default class AmountInputSkin extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { error, fees, total, currency } = this.props;
    const { intl } = this.context;

    const formattedFees = formattedAmountWithoutTrailingZeros(fees ? fees.toString() : '');
    const formattedTotal = formattedAmountWithoutTrailingZeros(total ? total.toString() : '');

    return (
      <div className={styles.root}>
        <InputSkin {...this.props} />
        {!error && (
          <span className={styles.fees}>
            {intl.formatMessage(messages.feesLabel, { amount: formattedFees })}
          </span>
        )}
        <span className={styles.total}>
          {total && !error && `= ${formattedTotal} ${currency}`}
        </span>
      </div>
    );
  }

}
