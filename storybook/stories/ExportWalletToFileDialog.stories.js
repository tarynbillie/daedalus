// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ExportWalletToFileDialog from '../../source/renderer/app/components/wallet/settings/ExportWalletToFileDialog';

import StoryDecorator from './support/StoryDecorator';

storiesOf('ExportWalletToFileDialog', module)

  .addDecorator((story, context) => (
    <StoryDecorator>
      {story(context)}
    </StoryDecorator>
  ))

  // ====== Stories ======

  .add('default', () => (
    <div>
      <ExportWalletToFileDialog
        walletName="Test Wallet"
        hasSpendingPassword={false}
        isSubmitting={false}
        onSubmit={action('onSubmit')}
        onClose={action('onClose')}
      />
    </div>
  ))

  .add('submitting', () => (
    <div>
      <ExportWalletToFileDialog
        walletName="Test Wallet"
        hasSpendingPassword={false}
        isSubmitting
        onSubmit={action('onSubmit')}
        onClose={action('onClose')}
      />
    </div>
  ))

  .add('spending password', () => (
    <div>
      <ExportWalletToFileDialog
        walletName="Test Wallet"
        hasSpendingPassword
        isSubmitting={false}
        onSubmit={action('onSubmit')}
        onClose={action('onClose')}
      />
    </div>
  ));
