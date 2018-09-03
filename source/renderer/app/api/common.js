// @flow
import { defineMessages } from 'react-intl';
import Wallet from '../domains/Wallet';
import WalletTransaction from '../domains/WalletTransaction';
import globalMessages from '../i18n/global-messages';

import LocalizableError from '../i18n/LocalizableError';
import type { BugReportFormData } from './etc/sendEtcBugReport';

const messages = defineMessages({
  genericApiError: {
    id: 'api.errors.GenericApiError',
    defaultMessage: '!!!An error occurred, please try again later.',
    description: 'Generic error message.'
  },
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
    description: '"Incorrect wallet password." error message.'
  },
  walletAlreadyRestoredError: {
    id: 'api.errors.WalletAlreadyRestoredError',
    defaultMessage: '!!!Wallet you are trying to restore already exists.',
    description: '"Wallet you are trying to restore already exists." error message.'
  },
  reportRequestError: {
    id: 'api.errors.ReportRequestError',
    defaultMessage: '!!!There was a problem sending the support request.',
    description: '"There was a problem sending the support request." error message'
  },
});

export class GenericApiError extends LocalizableError {
  constructor(reason?: Error) {
    super({
      id: messages.genericApiError.id,
      defaultMessage: messages.genericApiError.defaultMessage || '',
      reason,
    });
  }
}

export class IncorrectWalletPasswordError extends LocalizableError {
  constructor() {
    super({
      id: messages.incorrectWalletPasswordError.id,
      defaultMessage: messages.incorrectWalletPasswordError.defaultMessage || '',
    });
  }
}

export class WalletAlreadyRestoredError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletAlreadyRestoredError.id,
      defaultMessage: messages.walletAlreadyRestoredError.defaultMessage || '',
    });
  }
}

export class ReportRequestError extends LocalizableError {
  constructor() {
    super({
      id: messages.reportRequestError.id,
      defaultMessage: messages.reportRequestError.defaultMessage || '',
    });
  }
}

export class InvalidMnemonicError extends LocalizableError {
  constructor() {
    super({
      id: globalMessages.invalidMnemonic.id,
      defaultMessage: globalMessages.invalidMnemonic.defaultMessage,
    });
  }
}

export type CreateTransactionResponse = WalletTransaction;
export type CreateWalletResponse = Wallet;
export type DeleteWalletResponse = boolean;
export type GetLocalTimeDifferenceResponse = number;
export type GetWalletsResponse = Wallet[];
export type GetWalletRecoveryPhraseResponse = Array<string>;
export type RestoreWalletResponse = Wallet;
export type UpdateWalletResponse = Wallet;
export type UpdateWalletPasswordResponse = boolean;

export type CreateWalletRequest = {
  name: string,
  mnemonic: string,
  password: ?string,
};

export type UpdateWalletPasswordRequest = {
  walletId: string,
  oldPassword: ?string,
  newPassword: ?string,
};

export type DeleteWalletRequest = {
  walletId: string,
};

export type RestoreWalletRequest = {
  recoveryPhrase: string,
  walletName: string,
  walletPassword: ?string,
};

export type GetSyncProgressResponse = {
  localDifficulty: ?number,
  networkDifficulty: ?number,
};

export type GetTransactionsRequest = {
  walletId: string,
  searchTerm: string,
  skip: number,
  limit: number,
};

export type GetTransactionsResponse = {
  transactions: Array<WalletTransaction>,
  total: number,
};

export type SendBugReportRequest = BugReportFormData;
export type SendBugReportResponse = any;
