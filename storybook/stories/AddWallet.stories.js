// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import wordlist from 'bip39/wordlists/english';

import WalletAdd from '../../source/renderer/app/components/wallet/WalletAdd';
import WalletRestoreDialog from '../../source/renderer/app/components/wallet/WalletRestoreDialog';
import WalletFileImportDialog from '../../source/renderer/app/components/wallet/file-import/WalletFileImportDialog';

import StoryDecorator from './support/StoryDecorator';

storiesOf('AddWallet', module)

  .addDecorator((story, context) => (
    <StoryDecorator>
      {story(context)}
    </StoryDecorator>
  ))

  // ====== Stories ======

  .add('WalletAdd', () => (
    <div>
      <WalletAdd
        onCreate={() => {}}
        onImportFile={() => {}}
        onRestore={() => {}}
        isRestoreActive={false}
        isMaxNumberOfWalletsReached={false}
      />
    </div>
  ))

  .add('WalletRestoreDialog', () => (
    <div>
      <WalletRestoreDialog
        mnemonicValidator={() => true}
        showCertificateRestore={false}
        isSubmitting={false}
        onSubmit={action('onSubmit')}
        onCancel={action('onClose')}
        suggestedMnemonics={wordlist}
        onChoiceChange={() => {}}
      />
    </div>
  ))

  .add('WalletFileImportDialog', () => (
    <div>
      <WalletFileImportDialog
        isSubmitting={false}
        onSubmit={action('onSubmit')}
        onClose={action('onClose')}
        error={null}
      />
    </div>
  ));
